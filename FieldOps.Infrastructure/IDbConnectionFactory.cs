using System.Data;

namespace FieldOps.Infrastructure;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
