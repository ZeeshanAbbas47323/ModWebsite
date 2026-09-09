"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Play, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/image-url";
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, uploadService } from "@/services/upload.service";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreateReview,
  useMarkReviewHelpful,
  useReviews,
} from "@/hooks/use-reviews";
import type { Review } from "@/services/review.service";

const REVIEW_UPLOAD_FOLDER = "reviews";
const MAX_REVIEW_IMAGES = 5;

function Stars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex gap-1", className)}
      aria-label={`Rated ${rating} out of 5`}
    >
      {[...Array(5)].map((_, i) => (
        <Image
          key={i}
          src="/images/icons/star.svg"
          alt=""
          width={size}
          height={size}
          className={i < Math.round(rating) ? "" : "opacity-25 grayscale"}
        />
      ))}
    </div>
  );
}

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={value === star}
          className="transition-transform hover:scale-110"
        >
          <Image
            src="/images/icons/star.svg"
            alt=""
            width={24}
            height={24}
            className={star <= value ? "" : "opacity-25 grayscale"}
          />
        </button>
      ))}
    </div>
  );
}

function formatDisplayName(name: string): string {
  return name
    .split(" ")
    .map((word) =>
      word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word
    )
    .join(" ");
}

const REVIEWS_PAGE_SIZE = 5;

export function ProductReviews({ productId }: { productId: number }) {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useReviews({
    filters: { product_id: productId },
    page,
    limit: REVIEWS_PAGE_SIZE,
  });
  const [loadedReviews, setLoadedReviews] = useState<Review[]>([]);
  useEffect(() => {
    if (!data) return;
    setLoadedReviews((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);
  useEffect(() => {
    setPage(1);
    setLoadedReviews([]);
  }, [productId]);

  const createReview = useCreateReview(productId);
  const markHelpful = useMarkReviewHelpful();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const reviews = loadedReviews;
  const summary = data?.summary;
  const total = summary?.total_reviews ?? 0;
  const average = summary?.average_rating ?? 0;
  const distribution = summary?.rating_distribution ?? {};

  const addImage = async (file: File) => {
    setError(null);
    setUploadingImage(true);
    try {
      const uploaded = await uploadService.toStorage(file, REVIEW_UPLOAD_FOLDER, "image");
      setImages((prev) => [...prev, uploaded.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload that photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const addVideo = async (file: File) => {
    setError(null);
    setUploadingVideo(true);
    try {
      const uploaded = await uploadService.toStorage(file, REVIEW_UPLOAD_FOLDER, "video");
      setVideoUrl(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload that video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Pick a rating first.");
      return;
    }
    try {
      await createReview.mutateAsync({
        product_id: productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        images: images.length ? images : undefined,
        video_url: videoUrl ?? undefined,
      });
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);
      setVideoUrl(null);
      setFormOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't post your review. Please try again."
      );
    }
  };

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Reviews</h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading reviews…</p>
      ) : (
        <>
          <div className="mt-6 bg-[#F4F4F5] rounded-[24px] p-6 md:p-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
            <div className="shrink-0 text-center sm:text-left">
              <p className="text-5xl font-bold text-black leading-none">
                {average.toFixed(1)}
              </p>
              <Stars rating={average} size={18} className="mt-3 justify-center sm:justify-start" />
              <p className="mt-2 text-sm text-gray-600">
                Based on {total} review{total === 1 ? "" : "s"}
              </p>
            </div>

            {total > 0 && (
              <div className="flex-1 space-y-2 w-full min-w-0">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star] ?? 0;
                  const pct = total ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-10 shrink-0 text-gray-600 font-medium">
                        {star} ★
                      </span>
                      <div className="h-2 flex-1 min-w-0 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-gray-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8">
            {!isAuthenticated ? (
              <p className="text-sm text-gray-600">
                <Link href="/login" className="font-semibold underline">
                  Sign in
                </Link>{" "}
                to write a review.
              </p>
            ) : formOpen ? (
              <form
                onSubmit={submit}
                className="max-w-xl space-y-4 rounded-xl border border-gray-200 p-5"
              >
                <div className="space-y-2">
                  <Label>Your rating</Label>
                  <RatingInput value={rating} onChange={setRating} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-title">Title</Label>
                  <Input
                    id="review-title"
                    value={title}
                    maxLength={200}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sums up your experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-comment">Review</Label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How did the transfers press? How was the colour?"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos (optional)</Label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((url, i) => (
                      <div key={url} className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        <img src={resolveImageUrl(url)} alt="" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                          aria-label="Remove photo"
                          className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    ))}
                    {images.length < MAX_REVIEW_IMAGES && (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-black hover:text-black disabled:opacity-50"
                      >
                        {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
                      </button>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) addImage(file);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video (optional)</Label>
                  {videoUrl ? (
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                      <Play className="size-4 shrink-0 text-gray-500" />
                      <span className="flex-1 truncate text-gray-600">Video attached</span>
                      <button
                        type="button"
                        onClick={() => setVideoUrl(null)}
                        aria-label="Remove video"
                        className="text-gray-400 hover:text-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-black hover:text-black disabled:opacity-50"
                    >
                      {uploadingVideo ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                      {uploadingVideo ? "Uploading…" : "Add a video"}
                    </button>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept={ACCEPTED_VIDEO_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) addVideo(file);
                    }}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2">
                  <Button type="submit" disabled={createReview.isPending || uploadingImage || uploadingVideo}>
                    {createReview.isPending ? "Posting…" : "Post review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setFormOpen(true)}>Write a review</Button>
            )}
          </div>

          <div className="mt-10 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet — be the first.
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-sm font-bold text-black">
                      {(review.user?.full_name ?? "V")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-black">
                          {review.user?.full_name ? formatDisplayName(review.user.full_name) : "Verified buyer"}
                        </span>
                        {review.is_verified && (
                          <span className="rounded-full bg-[#F4F4F5] px-2 py-0.5 text-xs font-medium text-black">
                            Verified purchase
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Stars rating={review.rating} size={14} />
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <p className="mt-3 ml-12 font-semibold text-black">
                      {review.title}
                    </p>
                  )}
                  {review.comment && (
                    <p className="mt-1 ml-12 text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {((review.images?.length ?? 0) > 0 || review.video_url) && (
                    <div className="mt-3 ml-12 flex flex-wrap gap-2">
                      {review.images?.map((url) => (
                        <a
                          key={url}
                          href={resolveImageUrl(url)}
                          target="_blank"
                          rel="noreferrer"
                          className="block size-16 shrink-0 overflow-hidden rounded-lg border border-gray-200"
                        >
                          <img src={resolveImageUrl(url)} alt="" className="size-full object-cover" />
                        </a>
                      ))}
                      {review.video_url && (
                        <a
                          href={resolveImageUrl(review.video_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-black"
                        >
                          <Play className="size-5" />
                        </a>
                      )}
                    </div>
                  )}

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => markHelpful.mutate(review.id)}
                      disabled={markHelpful.isPending}
                      className="mt-3 ml-12 text-xs text-gray-500 underline hover:text-black"
                    >
                      Helpful{" "}
                      {review.helpful_count > 0 ? `(${review.helpful_count})` : ""}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {reviews.length < total && (
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Show more reviews (${total - reviews.length} left)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
