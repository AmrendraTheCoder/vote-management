import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
      maxlength: [20, "Room number cannot exceed 20 characters"],
    },
    hostel: {
      type: String,
      enum: ["GH", "BH"],
      required: [true, "Hostel is required"],
      default: "BH",
    },
    vote: {
      type: String,
      enum: ["", "Yes", "No", "Undecided", "Absent"],
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This will automatically handle createdAt and updatedAt
  }
);

// Index for better query performance - allowing multiple students per room
studentSchema.index({ roomNumber: 1, hostel: 1 });
studentSchema.index({ vote: 1 });
studentSchema.index({ createdAt: -1 });

// Pre-save middleware to update the updatedAt field
studentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for vote status display
studentSchema.virtual("voteStatus").get(function () {
  switch (this.vote) {
    case "Yes":
      return "Will Vote for Chirag Sir";
    case "No":
      return "Won't Vote for Chirag Sir";
    case "Undecided":
      return "Still Thinking";
    case "Absent":
      return "Not Available";
    default:
      return "Not Asked Yet";
  }
});

// Ensure virtuals are included in JSON output
studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
