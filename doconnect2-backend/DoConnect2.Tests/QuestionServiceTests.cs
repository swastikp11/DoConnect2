using DoConnect2.Data;
using DoConnect2.DTOs;
using DoConnect2.Models;
using DoConnect2.Services;
using DoConnect2.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Hosting;
using Moq;
using NUnit.Framework;

namespace DoConnect2.Tests
{
    [TestFixture]
    public class QuestionServiceTests
    {
        private AppDbContext _db;
        private QuestionService _questionService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _db = new AppDbContext(options);

            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(Path.GetTempPath());

            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            mockClients.Setup(c => c.Group(It.IsAny<string>()))
                       .Returns(mockClientProxy.Object);

            var mockHub = new Mock<IHubContext<NotificationHub>>();
            mockHub.Setup(h => h.Clients).Returns(mockClients.Object);

            _questionService = new QuestionService(
                _db, mockEnv.Object, mockHub.Object);

            _db.Users.Add(new User
            {
                UserId = 1,
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = "Test@123",
                Role = "User"
            });
            _db.SaveChanges();
        }

        [TearDown]
        public void TearDown()
        {
            _db.Dispose();
        }

        [Test]
        public async Task CreateAsync_ShouldCreateQuestion_WithPendingStatus()
        {
            var dto = new QuestionDto
            {
                Title = "Test Question",
                Body = "Test Body",
                Topic = "Testing"
            };

            var result = await _questionService.CreateAsync(dto, 1, null);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo("Test Question"));
            Assert.That(result.Status, Is.EqualTo("Pending"));
        }

        [Test]
        public async Task GetApprovedAsync_ShouldReturnOnlyApprovedQuestions()
        {
            _db.Questions.AddRange(
                new Question
                {
                    Title = "Approved Q",
                    Body = "Body",
                    Topic = "Test",
                    Status = "Approved",
                    UserId = 1
                },
                new Question
                {
                    Title = "Pending Q",
                    Body = "Body",
                    Topic = "Test",
                    Status = "Pending",
                    UserId = 1
                }
            );
            await _db.SaveChangesAsync();

            var result = await _questionService.GetApprovedAsync(null);

            Assert.That(result.Count(), Is.EqualTo(1));
            Assert.That(result.First().Title, Is.EqualTo("Approved Q"));
        }

        [Test]
        public async Task ApproveOrRejectAsync_ShouldApproveQuestion()
        {
            _db.Questions.Add(new Question
            {
                QuestionId = 1,
                Title = "Q",
                Body = "B",
                Topic = "T",
                Status = "Pending",
                UserId = 1
            });
            await _db.SaveChangesAsync();

            var result = await _questionService.ApproveOrRejectAsync(1, "Approve");

            Assert.That(result, Is.True);
            Assert.That(_db.Questions.First().Status, Is.EqualTo("Approved"));
        }

        [Test]
        public async Task ApproveOrRejectAsync_ShouldRejectQuestion()
        {
            _db.Questions.Add(new Question
            {
                QuestionId = 1,
                Title = "Q",
                Body = "B",
                Topic = "T",
                Status = "Pending",
                UserId = 1
            });
            await _db.SaveChangesAsync();

            var result = await _questionService.ApproveOrRejectAsync(1, "Reject");

            Assert.That(result, Is.True);
            Assert.That(_db.Questions.First().Status, Is.EqualTo("Rejected"));
        }

        [Test]
        public async Task DeleteAsync_ShouldDeleteQuestion()
        {
            _db.Questions.Add(new Question
            {
                QuestionId = 1,
                Title = "Q",
                Body = "B",
                Topic = "T",
                Status = "Pending",
                UserId = 1
            });
            await _db.SaveChangesAsync();

            var result = await _questionService.DeleteAsync(1);

            Assert.That(result, Is.True);
            Assert.That(_db.Questions.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task DeleteAsync_ShouldReturnFalse_WhenNotFound()
        {
            var result = await _questionService.DeleteAsync(999);
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task GetApprovedAsync_ShouldFilterBySearchQuery()
        {
            _db.Questions.AddRange(
                new Question
                {
                    Title = "Angular Tips",
                    Body = "Body",
                    Topic = "Angular",
                    Status = "Approved",
                    UserId = 1
                },
                new Question
                {
                    Title = "SQL Guide",
                    Body = "Body",
                    Topic = "Database",
                    Status = "Approved",
                    UserId = 1
                }
            );
            await _db.SaveChangesAsync();

            var result = await _questionService.GetApprovedAsync("Angular");

            Assert.That(result.Count(), Is.EqualTo(1));
            Assert.That(result.First().Title, Is.EqualTo("Angular Tips"));
        }
    }
}