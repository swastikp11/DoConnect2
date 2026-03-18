using DoConnect2.Models;
using Microsoft.EntityFrameworkCore;

namespace DoConnect2.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Image> Images { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Question>()
                .HasOne(q => q.User)
                .WithMany(u => u.Questions)
                .HasForeignKey(q => q.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Answer>()
                .HasOne(a => a.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Answer>()
                .HasOne(a => a.User)
                .WithMany(u => u.Answers)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Image>()
     .HasOne(i => i.Question)
     .WithMany(q => q.Images)
     .HasForeignKey(i => i.QuestionId)
     .OnDelete(DeleteBehavior.NoAction)
     .IsRequired(false);

            modelBuilder.Entity<Image>()
                .HasOne(i => i.Answer)
                .WithMany(a => a.Images)
                .HasForeignKey(i => i.AnswerId)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired(false);

            modelBuilder.Entity<User>().HasData(new User
            {
                UserId = 1,
                Username = "admin",
                Email = "admin@doconnect.com",
                PasswordHash = "Admin@123",
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
        }
    }
}