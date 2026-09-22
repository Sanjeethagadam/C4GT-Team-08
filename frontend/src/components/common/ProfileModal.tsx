import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User as UserIcon, Mail, Shield, Briefcase, GraduationCap, Hash, Phone, Edit2, Check, X, Camera, Trash2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { ImageCropper } from './ImageCropper';
import { getAvatarUrl } from '@/utils/urlUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  studentProfile?: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, studentProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatar: ''
  });
  
  const [originalAvatar, setOriginalAvatar] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      const initialAvatar = user.avatarFileId || user.avatar || '';
      setFormData({
        fullName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.fullName || ''),
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        avatar: initialAvatar
      });
      setOriginalAvatar(initialAvatar);
      setIsEditing(false);
      setError(null);
      setIsCropping(false);
      setRawImageSrc(null);
      if (user.role === 'STUDENT') {
        // Academic info comes from studentProfile prop
      }
    }
  }, [isOpen, user]);

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    STUDENT: 'Student',
    CTPO: 'Training & Placement Officer',
    HOD: 'Head of Department',
    PRINCIPAL: 'Principal',
    COORDINATOR: 'Coordinator',
    ADMIN: 'Administrator',
    CLASS_TEACHER: 'Class Teacher',
    FACULTY: 'Faculty'
  };

  const humanRole = roleLabels[user.role] || user.role;
  const currentDisplayName = formData.fullName || (user.role === 'STUDENT' ? studentProfile?.name : '') || user.username;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      let payload: any;
      if (formData.avatar !== originalAvatar) {
        payload = new FormData();
        if (formData.fullName !== undefined) payload.append('fullName', formData.fullName);
        if (formData.email !== undefined) payload.append('email', formData.email);
        if (formData.phoneNumber !== undefined) payload.append('phoneNumber', formData.phoneNumber);
        
        if (formData.avatar === '' || formData.avatar === null) {
          payload.append('avatar', '');
        } else if (formData.avatar && formData.avatar.startsWith('data:image')) {
          const res = await fetch(formData.avatar);
          const blob = await res.blob();
          payload.append('avatar', blob, 'avatar.png');
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
      const newAvatarId = updatedUser?.avatarFileId || updatedUser?.avatar || (formData.avatar === '' ? '' : formData.avatar);
      // Bust cache using timestamp for immediate visual update
      const displayUrl = newAvatarId ? (newAvatarId.startsWith('data:') || newAvatarId.startsWith('/uploads') ? newAvatarId : `${newAvatarId}?t=${Date.now()}`) : '';
      
      const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      sessionStorage.setItem('user', JSON.stringify({ ...storedUser, ...formData, avatarFileId: updatedUser?.avatarFileId, avatar: updatedUser?.avatar }));
      
      user.fullName = formData.fullName;
      user.email = formData.email;
      user.phoneNumber = formData.phoneNumber;
      user.avatarFileId = updatedUser?.avatarFileId;
      user.avatar = updatedUser?.avatar;
      
      // Force Topbar re-render by emitting event
      window.dispatchEvent(new Event('userProfileUpdated'));
      
      setOriginalAvatar(displayUrl);
      setFormData(prev => ({ ...prev, avatar: displayUrl }));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(prev => ({ ...prev, avatar: originalAvatar }));
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError("Invalid image type. Please upload a JPG, PNG, or WebP.");
        return;
      }
      // Validate size (e.g. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit.");
        return;
      }
      
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = (base64: string) => {
    setFormData(prev => ({ ...prev, avatar: base64 }));
    setIsCropping(false);
    setRawImageSrc(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setRawImageSrc(null);
  };
  
  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <UserIcon className="h-5 w-5 text-indigo-600" />
            User Profile
          </DialogTitle>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 gap-1.5 rounded-full px-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] px-6 py-6">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 border border-red-200 shadow-sm flex items-start gap-2"><X className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div>}

            {isCropping && rawImageSrc ? (
                <div className="mb-6">
                    <ImageCropper imageSrc={rawImageSrc} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 rounded-full bg-indigo-100 border-4 border-white shadow-md text-indigo-600 text-4xl font-bold overflow-hidden">
                        <AvatarImage src={getAvatarUrl(formData.avatar)} alt="Profile" />
                        <AvatarFallback className="bg-transparent text-indigo-600">
                          {currentDisplayName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-indigo-600 border-2 border-white shadow-sm p-2 rounded-full text-white hover:bg-indigo-700 transition-colors"
                          title="Change Photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
                    </div>
                    
                    {isEditing && formData.avatar && (
                        <div className="flex gap-2 mt-1">
                            <Button variant="ghost" size="sm" onClick={handleRemovePhoto} className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 rounded">
                                <Trash2 className="w-3 h-3 mr-1" /> Remove Photo
                            </Button>
                        </div>
                    )}
                    
                    <div className="text-center w-full mt-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input 
                            value={formData.fullName}
                            onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Full Name"
                            className="h-9 text-sm font-semibold text-center max-w-[240px] mx-auto bg-white"
                          />
                          <p className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-md inline-flex items-center">
                            <Shield className="w-3.5 h-3.5 mr-1.5" />
                            {humanRole} (Read-only)
                          </p>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">{currentDisplayName}</h3>
                          <p className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md inline-flex items-center mt-2 shadow-sm">
                            <Shield className="w-3.5 h-3.5 mr-1.5" />
                            {humanRole}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h4>
                    
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="bg-slate-50 p-2 rounded-md"><Mail className="w-4 h-4 text-slate-400" /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Email Address</p>
                        {isEditing ? (
                          <Input 
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="user@example.com"
                            type="email"
                            className="h-8 text-sm bg-slate-50 border-slate-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-800 font-medium">{formData.email || <span className="text-slate-400 italic font-normal">-</span>}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="bg-slate-50 p-2 rounded-md"><Phone className="w-4 h-4 text-slate-400" /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Phone Number</p>
                        {isEditing ? (
                          <Input 
                            value={formData.phoneNumber}
                            onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+1 (555) 000-0000"
                            className="h-8 text-sm bg-slate-50 border-slate-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-800 font-medium">{formData.phoneNumber || <span className="text-slate-400 italic font-normal">-</span>}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.role === 'STUDENT' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Information</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Hash className="w-3 h-3" /> Roll Number</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.rollNo || user.username || '-'}</p>
                          </div>
                          
                          <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Academics</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {studentProfile?.year ? `Year ${studentProfile.year} • Sem ${(studentProfile?.semesterId as any)?.semesterCode || '-'}` : '-'}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm col-span-2">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Branch</p>
                            <p className="text-sm font-semibold text-slate-800">{(studentProfile?.branchId as any)?.name || '-'}</p>
                          </div>
                          
                          <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm col-span-2">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> Class Teacher</p>
                            <p className="text-sm font-semibold text-slate-800">
                                {studentProfile?.classTeacherId ? 
                                  ((studentProfile.classTeacherId as any).firstName ? 
                                    `${(studentProfile.classTeacherId as any).firstName} ${(studentProfile.classTeacherId as any).lastName || ''}` 
                                    : (studentProfile.classTeacherId as any).username)
                                  : '-'}
                            </p>
                          </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account Information</h4>
                    
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="bg-slate-50 p-2 rounded-md"><UserIcon className="w-4 h-4 text-slate-400" /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">System Username</p>
                        <p className="text-sm text-slate-800 font-medium">{user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="bg-slate-50 p-2 rounded-md"><Shield className="w-4 h-4 text-slate-400" /></div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Account Status</p>
                        <p className="text-sm text-slate-800 font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Active
                        </p>
                      </div>
                    </div>

                    {user.role === 'CTPO' && user.scope && (
                      <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm space-y-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Branch Scope</p>
                          <p className="text-sm text-slate-800 font-medium">{user.scope.branch || user.scope.branchId || 'Assigned Branch'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Year Scope</p>
                          <p className="text-sm text-slate-800 font-medium">Year {user.scope.year || '-'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            )}
        </div>
        
        {isEditing && !isCropping && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="bg-white">
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
              {isSaving ? (
                 <div className="flex items-center"><span className="animate-spin mr-2 border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span> Saving...</div>
              ) : (
                 <><Check className="w-4 h-4 mr-1.5" /> Save Changes</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
