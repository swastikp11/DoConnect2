using DoConnect2.DTOs;
using DoConnect2.Data;
using DoConnect2.Hubs;
using DoConnect2.Models;
using DoConnect2.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DoConnect2.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<NotificationHub> _hub;

        public QuestionService(AppDbContext db, IWebHostEnvironment env, IHubContext<NotificationHub> hub)
        {
            _db = db;
            _env = env;
            _hub = hub;
        }

        public async Task<QuestionResponseDto> CreateAsync(QuestionDto dto, int userId, List<IFormFile>? images)
        {
            var question = new Question
            {
                Title = dto.Title,
                Body = dto.Body,
                Topic = dto.Topic,
                UserId = userId,
                Status = "Pending"
            };

            _db.Questions.Add(question);
            await _db.SaveChangesAsync();

            if (images != null && images.Count > 0)
                await SaveImagesAsync(images, question.QuestionId, null);

            await _hub.Clients.Group("Admins")
                .SendAsync("NewQuestion", $"New question posted: {question.Title}");

            return await MapToResponseAsync(question.QuestionId);
        }

        public async Task<IEnumerable<QuestionResponseDto>> GetApprovedAsync(string? searchQuery)
        {
            var query = _db.Questions
                .Include(q => q.User)
                .Include(q => q.Answers)
                .Include(q => q.Images)
                .Where(q => q.Status == "Approved");

            if (!string.IsNullOrWhiteSpace(searchQuery))
                query = query.Where(q =>
                    q.Title.Contains(searchQuery) ||
                    q.Body.Contains(searchQuery) ||
                    q.Topic.Contains(searchQuery));

            var questions = await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
            return questions.Select(MapToDto);
        }

        public async Task<QuestionResponseDto?> GetByIdAsync(int id)
        {
            var q = await _db.Questions
                .Include(q => q.User)
                .Include(q => q.Answers)
                .Include(q => q.Images)
                .FirstOrDefaultAsync(q => q.QuestionId == id);

            return q == null ? null : MapToDto(q);
        }

        public async Task<IEnumerable<QuestionResponseDto>> GetAllForAdminAsync()
        {
            var questions = await _db.Questions
                .Include(q => q.User)
                .Include(q => q.Answers)
                .Include(q => q.Images)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();

            return questions.Select(MapToDto);
        }

        public async Task<bool> ApproveOrRejectAsync(int id, string action)
        {
            var question = await _db.Questions.FindAsync(id);
            if (question == null) return false;

            question.Status = action == "Approve" ? "Approved" : "Rejected";
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var question = await _db.Questions.FindAsync(id);
            if (question == null) return false;

            _db.Questions.Remove(question);
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task SaveImagesAsync(List<IFormFile> files, int? questionId, int? answerId)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadsFolder);

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var uniqueName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                _db.Images.Add(new Image
                {
                    FileName = uniqueName,
                    ImagePath = $"/uploads/{uniqueName}",
                    QuestionId = questionId,
                    AnswerId = answerId
                });
            }

            await _db.SaveChangesAsync();
        }

        private async Task<QuestionResponseDto> MapToResponseAsync(int questionId)
        {
            var q = await _db.Questions
                .Include(q => q.User)
                .Include(q => q.Answers)
                .Include(q => q.Images)
                .FirstAsync(q => q.QuestionId == questionId);

            return MapToDto(q);
        }

        private static QuestionResponseDto MapToDto(Question q) => new()
        {
            QuestionId = q.QuestionId,
            Title = q.Title,
            Body = q.Body,
            Topic = q.Topic,
            Status = q.Status,
            CreatedAt = q.CreatedAt,
            AuthorUsername = q.User?.Username ?? "Unknown",
            AnswerCount = q.Answers?.Count ?? 0,
            ImagePaths = q.Images?.Select(i => i.ImagePath).ToList() ?? new()
        };
    }
}