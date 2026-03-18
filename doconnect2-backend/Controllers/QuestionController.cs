using System.Security.Claims;
using DoConnect2.DTOs;
using DoConnect2.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoConnect2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionService _questionService;

        public QuestionsController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var questions = await _questionService.GetApprovedAsync(search);
            return Ok(questions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var question = await _questionService.GetByIdAsync(id);
            if (question == null) return NotFound();
            return Ok(question);
        }

        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
            [FromForm] QuestionDto dto,
            [FromForm] List<IFormFile>? images)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _questionService.CreateAsync(dto, userId, images);
            return CreatedAtAction(nameof(GetById), new { id = result.QuestionId }, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var questions = await _questionService.GetAllForAdminAsync();
            return Ok(questions);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ApprovalDto dto)
        {
            if (dto.Action != "Approve" && dto.Action != "Reject")
                return BadRequest(new { message = "Action must be 'Approve' or 'Reject'." });

            var success = await _questionService.ApproveOrRejectAsync(id, dto.Action);
            if (!success) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _questionService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}