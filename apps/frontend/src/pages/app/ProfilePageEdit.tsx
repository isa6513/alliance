import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";

import {
  UpdateProfileDto,
  userFindMe,
  userUpdate,
} from "@alliance/shared/client";
import { useAppLoaderData } from "../../applayout";
import { getImageSource } from "../../lib/config";

const ProfileEditPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { profile } = useAppLoaderData();

  // Editable form state
  const [name, setName] = useState<string>(user?.name ?? "");
  const [bio, setBio] = useState<string>(profile?.profileDescription ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.profilePicture ?? null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  /** initialise local state from user profile once available */
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const response = await userFindMe();
        if (!response.data) {
          return;
        }
        setName(user.name);
        setBio(response.data.profileDescription || "");
        setAvatarUrl(response.data.profilePicture || null);
      }
    }
    if (user) {
      setName(user.name); //prefill data from auth
      loadProfile();
    }
  }, [user]);

  /**
   * Handle avatar <input type="file"> change – preview immediately and stash the
   * File object so we can send it on save.
   */
  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Basic client‑side validation – you could add file‑type/size checks here
    if (!file.type.startsWith("image/")) {
      return;
    }

    setAvatarFile(file);

    // Show immediate preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Save button – upload image first (if a new one was selected) then PATCH the
   * profile with name, bio & returned image URL.
   */
  const handleSave = async () => {
    console.log("handleSave");
    if (!user) return;

    try {
      //   let uploadedFile: string | undefined = undefined;

      //   if (avatarFile) {
      //     const response = await imagesUploadImage({
      //       body: { file: await avatarFile.text() },
      //     });
      //     console.log("got image upload response");
      //     if (response.data) {
      //       uploadedFile = response.data;
      //     }
      //   }

      console.log("handleSave 3");

      const payload: UpdateProfileDto = {
        name,
        profileDescription: bio,
        profilePicture: avatarUrl ?? undefined,
      };
      const response = await userUpdate({
        body: payload,
      });

      console.log("got response", response);

      navigate(`/user/${user.id}`);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16 flex items-center justify-center">
        <Card style={CardStyle.White} className="p-8 text-center space-y-4">
          <p>You must be logged in to edit your profile.</p>
          <Button onClick={() => navigate("/login")}>Log in</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-page w-full">
      <div className="max-w-[800px] mx-auto space-y-2">
        <div className="w-full h-[100px]"></div>
        <div className="px-8 relative space-y-2 border-stone-300 border py-4 rounded mx-2 bg-white">
          <div className="relative w-fit">
            <img
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : avatarUrl
                  ? getImageSource(avatarUrl)
                  : undefined
              }
              className="mt-[-55px] w-29 h-29 rounded-md object-cover"
            />
            <label className="cursor-pointer text-blue-600 underline text-sm absolute -top-5">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              Change photo
            </label>
          </div>
          <div className="flex gap-2 py-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-none focus:outline-none !text-[30px] font-bold"
            />
          </div>
          {/* stats row */}
          <div className="flex flex-row gap-5 cursor-pointer">
            <p className="text-zinc-500">
              <b className="text-zinc-900">n </b>
              actions completed
            </p>
            <p className="text-zinc-500">
              <b className="text-zinc-900">n </b>
              forum posts
            </p>
            <p className="text-zinc-500">
              <b className="text-zinc-900">n </b>
              Friends
            </p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            className="w-full border border-stone-300 focus:outline-none p-2 -ml-2 mt-2"
          />
          {/* button row */}
          <div className="absolute right-0 top-0 space-x-3 flex flex-row p-5">
            <Button color={ButtonColor.Blue} onClick={handleSave} className="">
              Save
            </Button>
          </div>
          {/* <div className="absolute -left-20 top-0 p-5">
          <BackButton />
          </div> */}
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-page pt-20 px-4 md:px-0">
    //   <div className="max-w-2xl mx-auto space-y-6">
    //     <Card style={CardStyle.White} className="p-8 space-y-6">
    //       <h1 className="text-2xl font-semibold text-center">Edit Profile</h1>

    //       {/* Avatar upload / preview */}
    //       <div className="flex flex-col items-center gap-4">
    //         <ProfileImage
    //           src={avatarUrl}
    //           className="w-24 h-24 border-2 border-stone-300 rounded-full object-cover"
    //         />
    //         <label className="cursor-pointer text-blue-600 underline text-sm">
    //           <input
    //             type="file"
    //             accept="image/*"
    //             className="hidden"
    //             onChange={handleAvatarChange}
    //           />
    //           Change photo
    //         </label>
    //       </div>

    //       {/* Name input */}
    //       <div className="space-y-2">
    //         <label className="block font-medium">Display Name</label>
    //         <input
    //           type="text"
    //           value={name}
    //           onChange={(e) => setName(e.target.value)}
    //           className="w-full border border-stone-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //         />
    //       </div>

    //       {/* Bio markdown textarea */}
    //       <div className="space-y-2">
    //         <label className="block font-medium">Bio / Description</label>
    //         <textarea
    //           value={bio}
    //           onChange={(e) => setBio(e.target.value)}
    //           rows={6}
    //           className="w-full border border-stone-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //           placeholder="Write something about yourself (supports Markdown)"
    //         />
    //         <p className="text-xs text-stone-500">Markdown preview:</p>
    //         <div className="border border-dashed rounded-md p-3 prose max-w-none">
    //           {bio.trim() ? (
    //             <ReactMarkdown>{bio}</ReactMarkdown>
    //           ) : (
    //             <p className="text-stone-400 italic">Nothing to preview…</p>
    //           )}
    //         </div>
    //       </div>

    //       {error && <p className="text-red-600 text-sm text-center">{error}</p>}

    //       <div className="flex justify-end gap-4 pt-2">
    //         <Button
    //           color={ButtonColor.Light}
    //           disabled={submitting}
    //           onClick={() => navigate(-1)}
    //         >
    //           Cancel
    //         </Button>
    //         <Button
    //           color={ButtonColor.Blue}
    //           disabled={submitting}
    //           onClick={handleSave}
    //         >
    //           {submitting ? "Saving…" : "Save Changes"}
    //         </Button>
    //       </div>
    //     </Card>
    //   </div>
    // </div>
  );
};

export default ProfileEditPage;
