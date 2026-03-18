using DoConnect2.Data;
using DoConnect2.DTOs;
using DoConnect2.Models;
using DoConnect2.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;

namespace DoConnect2.Tests
{
    [TestFixture]
    public class AuthServiceTests
    {
        private AppDbContext _db;
        private AuthService _authService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _db = new AppDbContext(options);

            var inMemorySettings = new Dictionary<string, string>
            {
                { "Jwt:Key", "DoConnect_SuperSecret_JWT_Key_2024_MustBe32CharsMin!" },
                { "Jwt:Issuer", "DoConnectAPI" },
                { "Jwt:Audience", "DoConnectClient" }
            };

            IConfiguration config = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _authService = new AuthService(_db, config);
        }

        [TearDown]
        public void TearDown()
        {
            _db.Dispose();
        }

        [Test]
        public async Task RegisterAsync_ShouldCreateUser_WhenEmailIsNew()
        {
            var dto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@test.com",
                Password = "Test@123"
            };

            var result = await _authService.RegisterAsync(dto);

            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Username, Is.EqualTo("testuser"));
            Assert.That(result.Role, Is.EqualTo("User"));
            Assert.That(result.Token, Is.Not.Empty);
        }

        [Test]
        public async Task RegisterAsync_ShouldReturnNull_WhenEmailAlreadyExists()
        {
            var dto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@test.com",
                Password = "Test@123"
            };

            await _authService.RegisterAsync(dto);
            var result = await _authService.RegisterAsync(dto);

            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreValid()
        {
            _db.Users.Add(new User
            {
                Username = "admin",
                Email = "admin@test.com",
                PasswordHash = "Admin@123",
                Role = "Admin"
            });
            await _db.SaveChangesAsync();

            var result = await _authService.LoginAsync(new LoginDto
            {
                Email = "admin@test.com",
                Password = "Admin@123"
            });

            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Token, Is.Not.Empty);
            Assert.That(result.Role, Is.EqualTo("Admin"));
        }

        [Test]
        public async Task LoginAsync_ShouldReturnNull_WhenPasswordIsWrong()
        {
            _db.Users.Add(new User
            {
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = "CorrectPassword",
                Role = "User"
            });
            await _db.SaveChangesAsync();

            var result = await _authService.LoginAsync(new LoginDto
            {
                Email = "test@test.com",
                Password = "WrongPassword"
            });

            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task LoginAsync_ShouldReturnNull_WhenEmailDoesNotExist()
        {
            var result = await _authService.LoginAsync(new LoginDto
            {
                Email = "nobody@test.com",
                Password = "Test@123"
            });

            Assert.That(result, Is.Null);
        }
    }
}