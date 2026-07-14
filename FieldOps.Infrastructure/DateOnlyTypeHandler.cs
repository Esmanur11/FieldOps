using System.Data;
using Dapper;

namespace FieldOps.Infrastructure;

public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly value) => parameter.Value = value;

    public override DateOnly Parse(object value) => value switch
    {
        DateOnly d => d,
        DateTime dt => DateOnly.FromDateTime(dt),
        _ => throw new NotSupportedException($"Cannot convert {value.GetType()} to DateOnly")
    };
}
