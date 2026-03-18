using DoConnect2.Models;
using System.ComponentModel.DataAnnotations;

namespace DoConnect2.Models
{
    public class Question
    {
        public int QuestionId { get; set; }

        [Required, MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Topic { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public ICollection<Image> Images { get; set; } = new List<Image>();
    }
}