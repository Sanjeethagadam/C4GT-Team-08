import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Mail,
  Briefcase,
  GraduationCap,
  Hash,
  Phone,
  Edit2,
  Check,
  X,
  Camera,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/services/authService";
import { ImageCropper } from "./ImageCropper";
import { getAvatarUrl } from "@/utils/urlUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const ProfileModal = ({ isOpen, onClose, user, studentProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
  });
  const [originalAvatar, setOriginalAvatar] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      const initialAvatar = user.avatarFileId || user.avatar || "";
      setFormData({
        fullName: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        avatar: initialAvatar,
      });
      setOriginalAvatar(initialAvatar);
      setIsEditing(false);
      setError(null);
      setIsCropping(false);
      setRawImageSrc(null);
    }
  }, [isOpen, user]);

  if (!user) return null;

  const roleLabels = {
    STUDENT: "Student",
    CTPO: "Training & Placement Officer",
    HOD: "Head of Department",
    PRINCIPAL: "Principal",
    COORDINATOR: "Academic Coordinator",
    ADMIN: "System Administrator",
    CLASS_TEACHER: "Class Teacher",
    FACULTY: "Faculty Member",
  };

  const humanRole = roleLabels[user.role] || user.role;
  const currentDisplayName =
    formData.fullName ||
    (user.role === "STUDENT" ? studentProfile?.name : "") ||
    user.username;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      let payload;
      if (formData.avatar !== originalAvatar) {
        payload = new FormData();
        if (formData.fullName !== undefined)
          payload.append("fullName", formData.fullName);
        if (formData.email !== undefined)
          payload.append("email", formData.email);
        if (formData.phoneNumber !== undefined)
          payload.append("phoneNumber", formData.phoneNumber);
        if (formData.avatar === "" || formData.avatar === null) {
          payload.append("avatar", "");
        } else if (
          formData.avatar &&
          formData.avatar.startsWith("data:image")
        ) {
          const res = await fetch(formData.avatar);
          const blob = await res.blob();
          payload.append("avatar", blob, "avatar.png");
        }
      } else {
        payload = {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        };
      }
      const response = await authService.updateProfile(payload);
      const updatedUser = response.user || response.data?.user;
      const newAvatarId =
        updatedUser?.avatarFileId ||
        updatedUser?.avatar ||
        (formData.avatar === "" ? "" : formData.avatar);

      const displayUrl = newAvatarId
        ? newAvatarId.startsWith("data:") || newAvatarId.startsWith("/uploads")
          ? newAvatarId
          : `${newAvatarId}?t=${Date.now()}`
        : "";

      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...formData,
          firstName,
          lastName,
          avatarFileId: updatedUser?.avatarFileId,
          avatar: updatedUser?.avatar,
        }),
      );
      try {
        Object.assign(user, {
          fullName: formData.fullName,
          firstName,
          lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          avatarFileId: updatedUser?.avatarFileId,
          avatar: updatedUser?.avatar,
        });
      } catch {
        // ignore
      }

      window.dispatchEvent(new Event("userProfileUpdated"));
      setOriginalAvatar(displayUrl);
      setFormData((prev) => ({ ...prev, avatar: displayUrl }));
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({ ...prev, avatar: originalAvatar }));
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Invalid image format. Please upload a JPG, PNG, or WebP.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = (base64) => {
    setFormData((prev) => ({ ...prev, avatar: base64 }));
    setIsCropping(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setRawImageSrc(null);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl bg-white p-0 gap-0 overflow-hidden rounded-xl border border-[#7DA0CA]/40 shadow-xl [&>button]:hidden">
        {/* Header with Academic Dark Blue Styling */}
        <DialogHeader className="px-6 py-4 bg-[#052659] text-white flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold flex items-center gap-2.5 text-white">
            <div className="h-7 w-7 rounded-md bg-[#021024] border border-[#5483B3]/40 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-[#C1E8FF]" />
            </div>
            <span>Academic Account Profile</span>
          </DialogTitle>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 gap-1.5 rounded-md px-3.5 border-[#5483B3]/50 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-md text-white/80 hover:bg-white/10 hover:text-white"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Desktop Body Layout */}
        <div className="overflow-y-auto max-h-[78vh] p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-200 flex items-start gap-2 font-medium">
              <X className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {isCropping && rawImageSrc ? (
            <div className="p-4 bg-[#f4f9fd] rounded-xl border border-[#7DA0CA]/30">
              <ImageCropper
                imageSrc={rawImageSrc}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Column: Avatar, Name, Role Card */}
              <div className="bg-[#f4f9fd] border border-[#7DA0CA]/30 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <Avatar className="h-28 w-28 rounded-full border-4 border-white shadow-md bg-[#052659] text-white">
                    <AvatarImage
                      src={getAvatarUrl(formData.avatar)}
                      alt={currentDisplayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#052659] text-white text-2xl font-bold">
                      {currentDisplayName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-[#052659] border-2 border-white shadow-md p-2 rounded-full text-white hover:bg-[#021024] transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleImageUpload}
                  />
                </div>

                {isEditing && formData.avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 rounded-md mb-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Photo
                  </Button>
                )}

                <h3 className="text-base font-bold text-[#021024] mt-1">
                  {currentDisplayName}
                </h3>
                <p className="text-xs text-[#5483B3] font-medium mt-0.5">
                  {user.username}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                  <Badge className="bg-[#052659] text-white border-none text-[11px] font-semibold px-2.5 py-0.5">
                    {humanRole}
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 text-[10px] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </Badge>
                </div>
              </div>

              {/* Right Columns (2-Span): Contact, Academic, Account Info */}
              <div className="md:col-span-2 space-y-5">
                {/* Personal & Contact Information */}
                <div>
                  <h4 className="text-xs font-bold text-[#5483B3] uppercase tracking-wider mb-2.5">
                    Contact & Personal Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg">
                      <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#5483B3]" /> Full Name
                      </p>
                      {isEditing ? (
                        <Input
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          placeholder="Your full name"
                          className="h-8 text-xs bg-white border-[#7DA0CA]/40"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-[#021024]">
                          {formData.fullName || "-"}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg">
                      <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#5483B3]" /> Phone Number
                      </p>
                      {isEditing ? (
                        <Input
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          placeholder="Enter phone number"
                          className="h-8 text-xs bg-white border-[#7DA0CA]/40"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-[#021024]">
                          {formData.phoneNumber || "-"}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg sm:col-span-2">
                      <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#5483B3]" /> Email Address
                      </p>
                      {isEditing ? (
                        <Input
                          value={formData.email}
                          type="email"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="username@gmail.com"
                          className="h-8 text-xs bg-white border-[#7DA0CA]/40"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-[#021024]">
                          {formData.email || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Context (For Students) */}
                {user.role === "STUDENT" && (
                  <div>
                    <Separator className="my-4 bg-[#7DA0CA]/30" />
                    <h4 className="text-xs font-bold text-[#5483B3] uppercase tracking-wider mb-2.5">
                      Academic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg">
                        <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5" /> Roll Number
                        </p>
                        <p className="text-xs font-semibold text-[#021024] font-mono">
                          {studentProfile?.rollNo || user.username || "-"}
                        </p>
                      </div>

                      <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg">
                        <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" /> Current Sem
                        </p>
                        <p className="text-xs font-semibold text-[#021024]">
                          {studentProfile?.year
                            ? `Year ${studentProfile.year} • Sem ${studentProfile?.semesterId?.semesterCode || "-"}`
                            : "-"}
                        </p>
                      </div>

                      <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg col-span-2">
                        <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> Branch & Department
                        </p>
                        <p className="text-xs font-semibold text-[#021024]">
                          {studentProfile?.branchId?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scope & Role Context (For CTPO / Staff) */}
                {user.role === "CTPO" && user.scope && (
                  <div>
                    <Separator className="my-4 bg-[#7DA0CA]/30" />
                    <h4 className="text-xs font-bold text-[#5483B3] uppercase tracking-wider mb-2.5">
                      Assigned Scope
                    </h4>
                    <div className="p-3 bg-[#f4f9fd]/50 border border-[#7DA0CA]/30 rounded-lg grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-0.5">
                          Target Branch
                        </p>
                        <p className="text-xs font-semibold text-[#021024]">
                          {user.scope.branch || user.scope.branchId || "Assigned Branch"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#5483B3] uppercase font-bold tracking-wider mb-0.5">
                          Academic Year
                        </p>
                        <p className="text-xs font-semibold text-[#021024]">
                          Year {user.scope.year || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Mode Sticky Action Footer */}
        {isEditing && !isCropping && (
          <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-[#7DA0CA]/30 bg-[#f4f9fd]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-white border-[#7DA0CA]/50 text-[#021024] hover:bg-slate-100 text-xs"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#052659] hover:bg-[#021024] text-white min-w-[120px] text-xs font-semibold shadow-xs"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-1.5 border-2 border-white/30 border-t-white rounded-full w-3.5 h-3.5"></span>
                  Saving...
                </div>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
