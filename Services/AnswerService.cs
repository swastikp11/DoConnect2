using DoConnect2.Data;
using DoConnect2.DTOs;
using DoConnect2.Hubs;
using DoConnect2.Models;
using DoConnect2.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DoConnect2.Services
{
    public class AnswerService : IAnswerService
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<NotificationHub> _hub;

        public AnswerService(AppDbContext db, IWebHostEnvironment env, IHubContext<NotificationHub> hub)
        {
            _db = db;
            _env = env;
            _hub = hub;
        }

        public async Task<AnswerResponseDto> CreateAsync(int questionId, AnswerDto dto, int userId, List<IFormFile>? images)
        {
            var answer = new Answer
            {
                Body = dto.Body,
                QuestionId = questionId,
                UserId = userId,
                Status = "Pending"
            };

            _db.Answers.Add(answer);
            await _db.SaveChangesAsync();

            if (images != null && images.Count > 0)
                await SaveImagesAsync(images, answer.AnswerId);

            var question = await _db.Questions.FindAsync(questionId);
            await _hub.Clients.Group("Admins")
                .SendAsync("NewAnswer", $"New answer posted on: {question?.Title}");

            return await MapToResponseAsync(answer.AnswerId);
        }

        public async Task<IEnumerable<AnswerResponseDto>> GetByQuestionAsync(int questionId)
        {
            var answers = await _db.Answers
                .Include(a => a.User)
                .Include(a => a.Images)
                .Where(a => a.QuestionId == questionId && a.Status == "Approved")
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return answers.Select(MapToDto);
        }

        public async Task<IEnumerable<AnswerResponseDto>> GetAllForAdminAsync()
        {
            var answers = await _db.Answers
                .Include(a => a.User)
                .Include(a => a.Images)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return answers.Select(MapToDto);
        }

        public async Task<bool> ApproveOrRejectAsync(int id, string action)
        {
            var answer = await _db.Answers.FindAsync(id);
            if (answer == null) return false;

            answer.Status = action == "Approve" ? "Approved" : "Rejected";
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var answer = await _db.Answers.FindAsync(id);
            if (answer == null) return false;

            _db.Answers.Remove(answer);
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task SaveImagesAsync(List<IFormFile> files, int answerId)
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
                    AnswerId = answerId
                });
            }

            await _db.SaveChangesAsync();
        }

        private async Task<AnswerResponseDto> MapToResponseAsync(int answerId)
        {
            var a = await _db.Answers
                .Include(a => a.User)
                .Include(a => a.Images)
                .FirstAsync(a => a.AnswerId == answerId);
            return MapToDto(a);
        }

        private static AnswerResponseDto MapToDto(Answer a) => new()
        {
            AnswerId = a.AnswerId,
            Body = a.Body,
            Status = a.Status,
            CreatedAt = a.CreatedAt,
            AuthorUsername = a.User?.Username ?? "Unknown",
            QuestionId = a.QuestionId,
            ImagePaths = a.Images?.Select(i => i.ImagePath).ToList() ?? new()
        };
    }
}