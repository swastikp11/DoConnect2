using System.ComponentModel.DataAnnotations;

namespace DoConnect2.DTOs
{
    public class RegisterDto
    {
        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int UserId { get; set; }
    }

    public class QuestionDto
    {
        [Required, MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Topic { get; set; } = string.Empty;
    }

    public class QuestionResponseDto
    {
        public int QuestionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;
        public int AnswerCount { get; set; }
        public List<string> ImagePaths { get; set; } = new();
    }

    public class AnswerDto
    {
        [Required]
        public string Body { get; set; } = string.Empty;
    }

    public class AnswerResponseDto
    {
        public int AnswerId { get; set; }
        public string Body { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string AuthorUsername { get; set; } = string.Empty;
        public int QuestionId { get; set; }
        public List<string> ImagePaths { get; set; } = new();
    }

    public class ApprovalDto
    {
        [Required]
        public string Action { get; set; } = string.Empty;
    }
}