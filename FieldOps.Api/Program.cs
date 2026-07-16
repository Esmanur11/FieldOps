using System.Text;
using FieldOps.Api.Hubs;
using FieldOps.Api.Services;
using FieldOps.Application.Audits;
using FieldOps.Application.Auth;
using FieldOps.Application.Machines;
using FieldOps.Application.Maintenance;
using FieldOps.Application.Materials;
using FieldOps.Application.Notifications;
using FieldOps.Application.Personnel;
using FieldOps.Application.Shifts;
using FieldOps.Application.Sites;
using FieldOps.Application.Users;
using FieldOps.Application.WorkOrders;
using FieldOps.Domain.Interfaces;
using FieldOps.Infrastructure;
using FieldOps.Infrastructure.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration).WriteTo.Console());

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddSignalR();

const string ClientCorsPolicy = "ClientCorsPolicy";
builder.Services.AddCors(options =>
{
    // AllowCredentials is required for the SignalR JS client's negotiate request, which sends
    // credentials: 'include' by default; only legal alongside a specific origin (not AnyOrigin).
    options.AddPolicy(ClientCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddScoped<ISiteRepository, SiteRepository>();
builder.Services.AddScoped<SiteService>();
builder.Services.AddScoped<IValidator<CreateSiteRequest>, CreateSiteRequestValidator>();

builder.Services.AddScoped<IPersonnelRepository, PersonnelRepository>();
builder.Services.AddScoped<PersonnelService>();
builder.Services.AddScoped<IValidator<CreatePersonnelRequest>, CreatePersonnelRequestValidator>();

builder.Services.AddScoped<IMachineRepository, MachineRepository>();
builder.Services.AddScoped<MachineService>();
builder.Services.AddScoped<IValidator<CreateMachineRequest>, CreateMachineRequestValidator>();

builder.Services.AddScoped<IWorkOrderRepository, WorkOrderRepository>();
builder.Services.AddScoped<WorkOrderService>();
builder.Services.AddScoped<IValidator<CreateWorkOrderRequest>, CreateWorkOrderRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateWorkOrderStatusRequest>, UpdateWorkOrderStatusRequestValidator>();
builder.Services.AddScoped<IValidator<AssignWorkOrderRequest>, AssignWorkOrderRequestValidator>();

builder.Services.AddScoped<IMaterialRepository, MaterialRepository>();
builder.Services.AddScoped<IMaterialStockRepository, MaterialStockRepository>();
builder.Services.AddScoped<IMaterialTransactionRepository, MaterialTransactionRepository>();
builder.Services.AddScoped<MaterialService>();
builder.Services.AddScoped<MaterialStockService>();
builder.Services.AddScoped<MaterialTransactionService>();
builder.Services.AddScoped<IValidator<CreateMaterialRequest>, CreateMaterialRequestValidator>();
builder.Services.AddScoped<IValidator<CreateMaterialTransactionRequest>, CreateMaterialTransactionRequestValidator>();

builder.Services.AddScoped<IMachineUsageLogRepository, MachineUsageLogRepository>();
builder.Services.AddScoped<IMaintenanceRecordRepository, MaintenanceRecordRepository>();
builder.Services.AddScoped<IMaintenancePredictionRepository, MaintenancePredictionRepository>();
builder.Services.AddScoped<MachineUsageLogService>();
builder.Services.AddScoped<MaintenanceRecordService>();
builder.Services.AddScoped<PredictiveMaintenanceService>();
builder.Services.AddScoped<IValidator<CreateMachineUsageLogRequest>, CreateMachineUsageLogRequestValidator>();
builder.Services.AddScoped<IValidator<CreateMaintenanceRecordRequest>, CreateMaintenanceRecordRequestValidator>();
builder.Services.AddHostedService<MaintenancePredictionBackgroundService>();

builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<IAuditFindingRepository, AuditFindingRepository>();
builder.Services.AddScoped<AuditService>();
builder.Services.AddScoped<AuditFindingService>();
builder.Services.AddScoped<IValidator<CreateAuditRequest>, CreateAuditRequestValidator>();
builder.Services.AddScoped<IValidator<CreateAuditFindingRequest>, CreateAuditFindingRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateAuditFindingRequest>, UpdateAuditFindingRequestValidator>();

builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IShiftAssignmentRepository, ShiftAssignmentRepository>();
builder.Services.AddScoped<ShiftService>();
builder.Services.AddScoped<ShiftAssignmentService>();
builder.Services.AddScoped<IValidator<CreateShiftRequest>, CreateShiftRequestValidator>();
builder.Services.AddScoped<IValidator<CreateShiftAssignmentRequest>, CreateShiftAssignmentRequestValidator>();

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationBroadcaster, SignalRNotificationBroadcaster>();
builder.Services.AddScoped<NotificationService>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IValidator<CreateUserRequest>, CreateUserRequestValidator>();

var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };

        // SignalR's browser client can't attach an Authorization header to its WebSocket/SSE
        // handshake, so it sends the JWT as an "access_token" query param instead — accept that
        // for the notifications hub only, not for regular HTTP API requests.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs/notifications"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(ClientCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
