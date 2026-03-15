using DoConnect2.DTOs;

namespace DoConnect2.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<QuestionResponseDto> CreateAsync(QuestionDto dto, int userId, List<IFormFile>? images);
        Task<IEnumerable<QuestionResponseDto>> GetApprovedAsync(string? searchQuery);
        Task<QuestionResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<QuestionResponseDto>> GetAllForAdminAsync();
        Task<bool> ApproveOrRejectAsync(int id, string action);
        Task<bool> DeleteAsync(int id);
    }
}