using System.Data;
using Dapper;

namespace FieldOps.Infrastructure;

public class TimeOnlyTypeHandler : SqlMapper.TypeHandler<TimeOnly>
{
    public override void SetValue(IDbDataParameter parameter, TimeOnly value) => parameter.Value = value;

    public override TimeOnly Parse(object value) => value switch
    {
        TimeOnly t => t,
        TimeSpan ts => TimeOnly.FromTimeSpan(ts),
        DateTime dt => TimeOnly.FromDateTime(dt),
        _ => throw new NotSupportedException($"Cannot convert {value.GetType()} to TimeOnly")
    };
}
