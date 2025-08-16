import { useState, useEffect } from "react";
import ApiService from "../services/api.js";

const useStudentData = (isAuthenticated = false) => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    forChirag: 0,
    againstChirag: 0,
    undecided: 0,
    absent: 0,
    notAsked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateTimers, setUpdateTimers] = useState({});
  const [lastFetch, setLastFetch] = useState(null);

  const CACHE_DURATION = 30000; // 30 seconds cache

  const moveStudent = async (studentId, direction) => {
    try {
      const studentIndex = students.findIndex((s) => s._id === studentId);
      if (studentIndex === -1) return;

      const newStudents = [...students];

      if (direction === "up" && studentIndex > 0) {
        [newStudents[studentIndex], newStudents[studentIndex - 1]] = [
          newStudents[studentIndex - 1],
          newStudents[studentIndex],
        ];
      } else if (direction === "down" && studentIndex < students.length - 1) {
        [newStudents[studentIndex], newStudents[studentIndex + 1]] = [
          newStudents[studentIndex + 1],
          newStudents[studentIndex],
        ];
      } else {
        return; // No movement needed
      }

      setStudents(newStudents);
      updateStatsLocal(newStudents);
      saveToLocalStorage(newStudents);
    } catch (error) {
      console.error("Error moving student:", error);
      throw new Error("Failed to move student");
    }
  };

  const bulkAddStudents = async (studentsData) => {
    try {
      setSyncing(true);
      setError(null);

      // Add students one by one with duplicate checking
      const addedStudents = [];
      const errors = [];

      for (const studentData of studentsData) {
        try {
          const response = await ApiService.addStudent(studentData);
          if (response.success) {
            addedStudents.push(response.data);
          } else {
            errors.push(`${studentData.name}: ${response.message}`);
          }
        } catch (error) {
          errors.push(`${studentData.name}: ${error.message}`);
        }
      }

      if (addedStudents.length > 0) {
        // Refresh the full list
        await loadStudents(true);
      }

      if (errors.length > 0) {
        throw new Error(
          `Some students could not be added: ${errors.join(", ")}`
        );
      }
    } catch (error) {
      console.error("Error in bulk add:", error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const updateStatsLocal = (studentsData) => {
    const total = studentsData.length;
    const forChirag = studentsData.filter((s) => s.vote === "Yes").length;
    const againstChirag = studentsData.filter((s) => s.vote === "No").length;
    const undecided = studentsData.filter((s) => s.vote === "Undecided").length;
    const absent = studentsData.filter((s) => s.vote === "Absent").length;
    const notAsked = studentsData.filter((s) => s.vote === "").length;

    setStats({ total, forChirag, againstChirag, undecided, absent, notAsked });
  };

  const loadStudents = async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    const now = Date.now();
    if (
      !forceRefresh &&
      lastFetch &&
      now - lastFetch < CACHE_DURATION &&
      students.length > 0
    ) {
      console.log("Using cached data, skipping API call");
      return;
    }

    try {
      setError(null);

      if (isOnline) {
        console.log("Fetching students from API...");
        const response = await ApiService.getStudents();

        if (response.success && response.data) {
          setStudents(response.data);
          updateStatsLocal(response.data);
          saveToLocalStorage(response.data);
          setLastFetch(now);
          console.log(`Loaded ${response.data.length} students from API`);
        } else {
          throw new Error(response.message || "Failed to fetch students");
        }
      } else {
        // Load from localStorage in offline mode
        const cachedData = localStorage.getItem("voteManagerStudents");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setStudents(parsedData);
          updateStatsLocal(parsedData);
        }
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setError("Failed to load students. Using cached data if available.");

      // Fallback to cached data
      const cachedData = localStorage.getItem("voteManagerStudents");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setStudents(parsedData);
        updateStatsLocal(parsedData);
      }
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (newStudent = null) => {
    const studentData = newStudent || {
      name: "New Student",
      roomNumber: "Room-" + (students.length + 1),
      hostel: "BH",
      vote: "",
    };

    try {
      setError(null);

      if (isOnline) {
        console.log("Creating student via API...");
        const response = await ApiService.createStudent(studentData);

        if (response.success) {
          const newStudentData = response.data;
          setStudents((prev) => [...prev, newStudentData]);
          updateStatsLocal([...students, newStudentData]);
          saveToLocalStorage([...students, newStudentData]);
          setLastFetch(null);
          console.log("Student created successfully");
          return { success: true, data: newStudentData };
        } else {
          throw new Error(response.message || "Failed to create student");
        }
      } else {
        // Offline mode
        const localStudent = {
          ...studentData,
          _id: "local_" + Date.now(),
          createdAt: new Date().toISOString(),
        };
        const updatedStudents = [...students, localStudent];
        setStudents(updatedStudents);
        updateStatsLocal(updatedStudents);
        saveToLocalStorage(updatedStudents);
        return { success: true, data: localStudent };
      }
    } catch (error) {
      console.error("Error adding student:", error);
      const errorMessage =
        error.message || "Failed to add student. Please try again.";

      if (errorMessage.includes("already exists")) {
        return { success: false, error: errorMessage, isDuplicate: true };
      }

      setError(`Add Student Error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  const removeStudent = async (id) => {
    try {
      if (isOnline && !id.toString().startsWith("local_")) {
        const updatedStudents = students.filter((s) => s._id !== id);
        setStudents(updatedStudents);
        updateStatsLocal(updatedStudents);
        saveToLocalStorage(updatedStudents);

        await ApiService.deleteStudent(id);
        setLastFetch(null);
      } else {
        const updatedStudents = students.filter((s) => s._id !== id);
        setStudents(updatedStudents);
        updateStatsLocal(updatedStudents);
        saveToLocalStorage(updatedStudents);
      }
    } catch (error) {
      console.error("Error removing student:", error);
      setError("Failed to remove student. Please try again.");
      await loadStudents(true);
    }
  };

  const updateStudent = async (id, field, value) => {
    const updatedStudents = students.map((student) =>
      student._id === id ? { ...student, [field]: value } : student
    );

    setStudents(updatedStudents);
    updateStatsLocal(updatedStudents);
    saveToLocalStorage(updatedStudents);

    if (isOnline && !id.toString().startsWith("local_")) {
      if (updateTimers[id]) {
        clearTimeout(updateTimers[id]);
      }

      const timer = setTimeout(async () => {
        try {
          const studentToUpdate = updatedStudents.find((s) => s._id === id);
          if (studentToUpdate) {
            console.log(`Updating student ${id} via API...`);
            await ApiService.updateStudent(id, {
              name: studentToUpdate.name,
              roomNumber: studentToUpdate.roomNumber,
              hostel: studentToUpdate.hostel || "BH",
              vote: studentToUpdate.vote,
            });
            console.log(`Student ${id} updated successfully`);
          }
        } catch (err) {
          console.error("Error updating student:", err);
          const errorMessage = err.message || "Failed to update student";

          if (errorMessage.includes("already exists")) {
            return { success: false, error: errorMessage, isDuplicate: true };
          } else {
            setError(`Update Error: ${errorMessage}`);
          }
        }

        setUpdateTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[id];
          return newTimers;
        });
      }, 1000);

      setUpdateTimers((prev) => ({ ...prev, [id]: timer }));
    }
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      await loadStudents(true);
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  const saveToLocalStorage = (studentsData) => {
    localStorage.setItem("voteManagerStudents", JSON.stringify(studentsData));
  };

  // Load students when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      Object.values(updateTimers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [updateTimers]);

  return {
    students,
    setStudents,
    stats,
    loading,
    error,
    setError,
    syncing,
    isOnline,
    loadStudents,
    addStudent,
    deleteStudent: removeStudent, // Alias for consistency
    removeStudent,
    updateStudent,
    moveStudent,
    bulkAddStudents,
    refreshData: loadStudents, // Alias for refreshing data
    syncData,
    updateStatsLocal,
    saveToLocalStorage,
  };
};

export { useStudentData };
