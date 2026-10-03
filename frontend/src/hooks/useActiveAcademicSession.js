import { useState, useEffect } from "react";
import { academicYearService } from "@/services/academicYearService";

export const useActiveAcademicSession = () => {
  const [activeSessionString, setActiveSessionString] = useState("2025–2026");

  useEffect(() => {
    let mounted = true;
    const fetchSession = async () => {
      try {
        const response = await academicYearService.getAllAcademicYears();
        // Handle both possible Axios/backend wrappers ({ data: [...] } or [...])
        const years = Array.isArray(response) ? response : (response?.data || []);
        
        const active = years.find((y) => y.status === "ACTIVE" || y.isCurrent === true);
        if (active && mounted) {
          setActiveSessionString(active.academicYear);
        }
      } catch (err) {
        console.error("Failed to fetch active academic session", err);
      }
    };
    fetchSession();
    return () => {
      mounted = false;
    };
  }, []);

  return activeSessionString;
};
