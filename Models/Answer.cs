using DoConnect2.Models;
using System.ComponentModel.DataAnnotations;

namespace DoConnect2.Models
{
    public class Answer
    {
        public int AnswerId { get; set; }

        [Required]
        public string Body { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<Image> Images { get; set; } = new List<Image>();
    }
}