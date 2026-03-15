using DoConnect2.DTOs;

namespace DoConnect2.Services.Interfaces
{
    public interface IAnswerService
    {
        Task<AnswerResponseDto> CreateAsync(int questionId, AnswerDto dto, int userId, List<IFormFile>? images);
        Task<IEnumerable<AnswerResponseDto>> GetByQuestionAsync(int questionId);
        Task<IEnumerable<AnswerResponseDto>> GetAllForAdminAsync();
        Task<bool> ApproveOrRejectAsync(int id, string action);
        Task<bool> DeleteAsync(int id);
    }
}