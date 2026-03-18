using DoConnect2.Models;

namespace DoConnect2.Models
{
    public class Image
    {
        public int ImageId { get; set; }
        public string ImagePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public int? QuestionId { get; set; }
        public Question? Question { get; set; }

        public int? AnswerId { get; set; }
        public Answer? Answer { get; set; }
    }
}