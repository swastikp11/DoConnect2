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
    public class AnswerServiceTests
    {
        private AppDbContext _db;
        private AnswerService _answerService;

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

            _answerService = new AnswerService(
                _db, mockEnv.Object, mockHub.Object);

            _db.Users.Add(new User
            {
                UserId = 1,
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = "Test@123",
                Role = "User"
            });
            _db.Questions.Add(new Question
            {
                QuestionId = 1,
                Title = "Test Q",
                Body = "Body",
                Topic = "Test",
                Status = "Approved",
                UserId = 1
            });
            _db.SaveChanges();
        }

        [TearDown]
        public void TearDown()
        {
            _db.Dispose();
        }

        [Test]
        public async Task CreateAsync_ShouldCreateAnswer_WithPendingStatus()
        {
            var dto = new AnswerDto { Body = "My Answer" };

            var result = await _answerService.CreateAsync(1, dto, 1, null);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Body, Is.EqualTo("My Answer"));
            Assert.That(result.Status, Is.EqualTo("Pending"));
        }

        [Test]
        public async Task GetByQuestionAsync_ShouldReturnOnlyApprovedAnswers()
        {
            _db.Answers.AddRange(
                new Answer
                {
                    Body = "Approved A",
                    Status = "Approved",
                    QuestionId = 1,
                    UserId = 1
                },
                new Answer
                {
                    Body = "Pending A",
                    Status = "Pending",
                    QuestionId = 1,
                    UserId = 1
                }
            );
            await _db.SaveChangesAsync();

            var result = await _answerService.GetByQuestionAsync(1);

            Assert.That(result.Count(), Is.EqualTo(1));
            Assert.That(result.First().Body, Is.EqualTo("Approved A"));
        }

        [Test]
        public async Task ApproveOrRejectAsync_ShouldApproveAnswer()
        {
            _db.Answers.Add(new Answer
            {
                AnswerId = 1,
                Body = "A",
                Status = "Pending",
                QuestionId = 1,
                UserId = 1
            });
            await _db.SaveChangesAsync();

            var result = await _answerService.ApproveOrRejectAsync(1, "Approve");

            Assert.That(result, Is.True);
            Assert.That(_db.Answers.First().Status, Is.EqualTo("Approved"));
        }

        [Test]
        public async Task ApproveOrRejectAsync_ShouldRejectAnswer()
        {
            _db.Answers.Add(new Answer
            {
                AnswerId = 1,
                Body = "A",
                Status = "Pending",
                QuestionId = 1,
                UserId = 1
            });
            await _db.SaveChangesAsync();

            var result = await _answerService.ApproveOrRejectAsync(1, "Reject");

            Assert.That(result, Is.True);
            Assert.That(_db.Answers.First().Status, Is.EqualTo("Rejected"));
        }

        [Test]
        public async Task DeleteAsync_ShouldDeleteAnswer()
        {
            _db.Answers.Add(new Answer
            {
                AnswerId = 1,
                Body = "A",
                Status = "Pending",
                QuestionId = 1,
                UserId = 1
            });
            await _db.SaveChangesAsync();

            var result = await _answerService.DeleteAsync(1);

            Assert.That(result, Is.True);
            Assert.That(_db.Answers.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task DeleteAsync_ShouldReturnFalse_WhenAnswerNotFound()
        {
            var result = await _answerService.DeleteAsync(999);
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task GetAllForAdminAsync_ShouldReturnAllAnswers()
        {
            _db.Answers.AddRange(
                new Answer
                {
                    Body = "A1",
                    Status = "Approved",
                    QuestionId = 1,
                    UserId = 1
                },
                new Answer
                {
                    Body = "A2",
                    Status = "Pending",
                    QuestionId = 1,
                    UserId = 1
                },
                new Answer
                {
                    Body = "A3",
                    Status = "Rejected",
                    QuestionId = 1,
                    UserId = 1
                }
            );
            await _db.SaveChangesAsync();

            var result = await _answerService.GetAllForAdminAsync();

            Assert.That(result.Count(), Is.EqualTo(3));
        }
    }
}