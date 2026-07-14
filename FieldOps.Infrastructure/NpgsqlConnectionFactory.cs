using System.Data;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace FieldOps.Infrastructure;

public class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    static NpgsqlConnectionFactory()
    {
        SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
    }

    public NpgsqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("ConnectionStrings:Default is not configured.");
    }

    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
}
