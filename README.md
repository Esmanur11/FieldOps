# FieldOps

FieldOps, inşaat şirketlerinin şantiye operasyonlarını — personel, makine/bakım, malzeme/stok ve denetim (audit) süreçlerini — tek bir platformda yönetmesini sağlayan bir backend sistemidir.

Amaç, sahada yaygın olan dağınık Excel/kağıt takibinin yerine geçerek:
- **Görünürlük**: tüm şantiyelerin, personelin ve makinelerin tek merkezden izlenmesi,
- **İzlenebilirlik**: her işlemin (vardiya, bakım, malzeme hareketi, denetim bulgusu) kayıt altına alınması,
- **Otomatik uyarı**: stok eşiklerinin altına düşen malzemeler, bakım zamanı gelen makineler ve açık denetim bulguları için bildirim üretilmesi

sağlamaktır.

## Mimari

Çözüm, bağımlılıkların içe doğru aktığı (Dependency Rule) katmanlı bir mimari izler. `Domain` hiçbir katmana bağımlı değildir; dış katmanlar `Domain`'e bağımlıdır.

```
                          ┌─────────────────────┐
                          │      FieldOps.Api     │
                          │  Controllers, Program  │
                          │   (HTTP, DI, Serilog)   │
                          └──────────┬──────────┘
                                     │ depends on
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
        ┌───────────────────────┐         ┌───────────────────────────┐
        │  FieldOps.Application │         │  FieldOps.Infrastructure  │
        │  DTO, Request, Validator│        │  Dapper Repository impl.  │
        │  Service (use case)     │        │  Npgsql connection factory│
        └───────────┬────────────┘         └─────────────┬─────────────┘
                    │ depends on                          │ depends on
                    └────────────────┬────────────────────┘
                                      ▼
                          ┌─────────────────────┐
                          │     FieldOps.Domain    │
                          │  Entities, Interfaces   │
                          │  (repository sözleşmeleri)│
                          └─────────────────────┘

        FieldOps.Tests  →  FieldOps.Application (ve genişleyecek şekilde diğer katmanlar)
```

- **FieldOps.Domain**: Saf iş nesneleri (`Entities`) ve repository arayüzleri (`Interfaces`). Dış dünyaya (veritabanı, framework) bağımlılığı yoktur.
- **FieldOps.Application**: Use-case / servis katmanı. DTO'lar, request modelleri, FluentValidation doğrulayıcıları ve `Domain`'deki arayüzleri kullanan servisler burada yaşar. Hangi ORM/veritabanının kullanıldığını bilmez.
- **FieldOps.Infrastructure**: `Domain` arayüzlerinin somut implementasyonları. Dapper ile ham SQL çalıştırır, PostgreSQL'e Npgsql üzerinden bağlanır.
- **FieldOps.Api**: ASP.NET Core Web API. Controller'lar, dependency injection kayıtları, Serilog yapılandırması ve uygulamanın giriş noktası (`Program.cs`).
- **FieldOps.Tests**: xUnit test projesi.

## Kullanılan Teknolojiler

| Teknoloji | Kullanım Amacı |
|---|---|
| C# / .NET 10 | Uygulama dili ve çalışma zamanı |
| ASP.NET Core Web API | HTTP API katmanı |
| Dapper | Ham SQL ile veri erişimi (ORM değil, micro-ORM) |
| PostgreSQL | İlişkisel veritabanı |
| Npgsql | PostgreSQL için .NET veri sağlayıcısı |
| FluentValidation | İstek (request) doğrulama kuralları |
| Serilog | Yapılandırılmış (structured) loglama |
| JWT | Kimlik doğrulama (planlanan/ilerleyen aşama) |
| xUnit | Birim testleri |
| Docker / Docker Compose | Yerel PostgreSQL ortamı |

## Kurulum

### 1. Repoyu klonla

```bash
git clone https://github.com/Esmanur11/FieldOps.git
cd FieldOps
```

### 2. PostgreSQL'i Docker ile ayağa kaldır

```bash
docker compose up -d
```

Bu komut, `docker-compose.yml` içinde tanımlı `fieldops-db` container'ını başlatır:
- Host port: `5433` → Container port: `5432`
- Database: `fieldops_db`
- Kullanıcı: `fieldops` / Şifre: `fieldops123`

### 3. `appsettings.json` bağlantı ayarını kontrol et

`FieldOps.Api/appsettings.json` içindeki `ConnectionStrings:Default` alanının Docker Compose ayarlarınla eşleştiğinden emin ol:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5433;Database=fieldops_db;Username=fieldops;Password=fieldops123"
  }
}
```

### 4. Veritabanı şemasını oluştur

```bash
docker exec -i fieldops-db psql -U fieldops -d fieldops_db < schema.sql
```

`schema.sql`, `sites`, `personnel`, `machines`, `maintenance_records`, `materials`, `work_orders`, `audits` ve benzeri tüm tabloları oluşturur.

### 5. Uygulamayı çalıştır

```bash
cd FieldOps.Api
dotnet run
```

API varsayılan olarak `http://localhost:5050` adresinde ayağa kalkar (bkz. `Properties/launchSettings.json`).

## Sites Modülü — Tamamlanan Endpoint'ler

Uçtan uca tamamlanan ilk modül **Sites** (şantiyeler). Katmanlar: `ISiteRepository` (Domain) → `SiteRepository` (Infrastructure, Dapper) → `SiteService` (Application) → `SitesController` (Api).

| Metot | Endpoint | Açıklama | Başarılı Yanıt |
|---|---|---|---|
| `GET` | `/api/sites` | Tüm şantiyeleri listeler | `200 OK` |
| `GET` | `/api/sites/{id}` | Id'ye göre tek şantiye getirir | `200 OK` / `404 Not Found` |
| `POST` | `/api/sites` | Yeni şantiye oluşturur (FluentValidation ile doğrulanır) | `201 Created` |
| `PUT` | `/api/sites/{id}` | Var olan şantiyeyi günceller | `204 No Content` / `404 Not Found` |

Örnek istek gövdesi (`POST`/`PUT`):

```json
{
  "name": "Ankara Şantiye",
  "location": "Ankara, Sincan OSB",
  "startDate": "2026-01-15",
  "status": "active"
}
```

## Karşılaşılan Zorluklar

Sites modülünü uçtan uca test ederken Dapper + Npgsql + PostgreSQL `date` sütunu kombinasyonunda iki gerçek bug ile karşılaşıldı:

**1. Okuma sorunu — `DateOnly` deserialize hatası**

`sites.start_date` sütunu PostgreSQL'de `DATE` tipinde. Npgsql, `DATE` sütunlarını .NET tarafında varsayılan olarak `DateOnly` tipine eşler. `Site` entity'sindeki `StartDate` alanı ilk halinde `DateTime` olduğundan, Dapper okuma sırasında `DateOnly` değerini `DateTime`'a `Convert.ChangeType` ile dönüştürmeye çalışıyor ve `DateOnly` `IConvertible` arayüzünü implemente etmediği için şu hatayla patlıyordu:

```
System.Data.DataException: Error parsing column 3 (StartDate=15.01.2026 - DateOnly)
 ---> System.InvalidCastException: Object must implement IConvertible.
```

Çözüm: `Site`, `SiteDto` ve `CreateSiteRequest` içindeki `StartDate` alanları `DateTime` yerine `DateOnly` yapıldı — zaten saat bilgisi taşımayan bir sütun için de daha doğru bir tip.

**2. Yazma sorunu — Dapper'ın `DateOnly` parametre desteği yok**

Okuma sorunu çözüldükten sonra bu kez `INSERT`/`UPDATE` sırasında yeni bir hata çıktı. Dapper'ın parametre oluşturma mekanizması (`SqlMapper.LookupDbType`), `DateOnly` CLR tipini bilmediği için parametreyi oluşturamıyor:

```
System.NotSupportedException: The member StartDate of type System.DateOnly cannot be used as a parameter value
```

Çözüm: `FieldOps.Infrastructure/DateOnlyTypeHandler.cs` adında, `SqlMapper.TypeHandler<DateOnly>`'den türeyen özel bir type handler yazıldı. Bu handler, parametre yazarken `DateOnly` değerini doğrudan `IDbDataParameter.Value`'ya atıyor (Npgsql bunu native olarak kabul ediyor), okuma sırasında da `DateOnly`/`DateTime` gelen değerleri `DateOnly`'ye normalize ediyor. Handler, `NpgsqlConnectionFactory`'nin static constructor'ında `SqlMapper.AddTypeHandler(...)` ile bir kez, uygulama başlangıcında register ediliyor.

Bu iki bug, "build başarılı" olmasının runtime davranışını garanti etmediğinin somut bir örneği — hata ancak gerçek bir PostgreSQL bağlantısına karşı `POST`/`GET` çağrıları yapılınca ortaya çıktı.

## Roadmap

Sites modülü dışında, `schema.sql` içinde şeması hazır olan ama henüz uygulama katmanları yazılmamış modüller:

- [ ] **Personnel** — şantiye personeli, vardiya (shift) ve vardiya atamaları (check-in/check-out)
- [ ] **Machine / Maintenance** — makine envanteri, kullanım logları (`machine_usage_logs`), bakım kayıtları (`maintenance_records`)
- [ ] **Material / Stok** — malzeme tanımları, stok seviyeleri (`material_stocks`), stok hareketleri (`material_transactions`), iş emri malzeme ihtiyaçları (`work_order_materials`)
- [ ] **Audit** — denetimler (`audits`) ve denetim bulguları (`audit_findings`), düzeltici aksiyon takibi
- [ ] **Bildirim (Notifications)** — stok eşiği, bakım zamanı ve açık denetim bulgusu gibi durumlar için otomatik uyarı üretimi (`notifications` tablosu)
- [ ] **Dashboard** — şantiye/personel/makine/malzeme durumunu özetleyen görünürlük ekranı
- [ ] **Kimlik doğrulama** — JWT tabanlı kullanıcı girişi ve rol bazlı yetkilendirme (`users` tablosu)
- [ ] **Bakım tahmini (AI)** — `maintenance_predictions` tablosundaki geçmiş kullanım ve bakım verilerinden yola çıkarak makine arıza riskini tahmin eden model
