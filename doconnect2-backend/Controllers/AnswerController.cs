using DoConnect2.Data;
using System.Security.Claims;
using DoConnect2.DTOs;
using DoConnect2.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoConnect2.Controllers
{
    [ApiController]
    [Route("api/questions/{questionId}/answers")]
    public class AnswersController : ControllerBase
    {
        private readonly IAnswerService _answerService;

        public AnswersController(IAnswerService answerService)
        {
            _answerService = answerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByQuestion(int questionId)
        {
            var answers = await _answerService.GetByQuestionAsync(questionId);
            return Ok(answers);
        }

        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
            int questionId,
            [FromForm] AnswerDto dto,
            [FromForm] List<IFormFile>? images)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _answerService.CreateAsync(questionId, dto, userId, images);
            return CreatedAtAction(nameof(GetByQuestion), new { questionId }, result);
        }
    }

    [ApiController]
    [Route("api/answers")]
    public class AnswerAdminController : ControllerBase
    {
        private readonly IAnswerService _answerService;

        public AnswerAdminController(IAnswerService answerService)
        {
            _answerService = answerService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var answers = await _answerService.GetAllForAdminAsync();
            return Ok(answers);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ApprovalDto dto)
        {
            if (dto.Action != "Approve" && dto.Action != "Reject")
                return BadRequest(new { message = "Action must be 'Approve' or 'Reject'." });

            var success = await _answerService.ApproveOrRejectAsync(id, dto.Action);
            if (!success) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _answerService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}