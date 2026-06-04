import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Share2,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { data: authUser } = useUser();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/store/products/${id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error("Please sign in");
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          productId: parseInt(id),
          quantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Alert.alert("Added to Cart!", "Item added successfully.", [
        { text: "View Cart", onPress: () => router.push("/cart") },
        { text: "Continue", style: "cancel" },
      ]);
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error("Please sign in");
      const res = await fetch("/api/wishlist", {
        method: product.inWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          productId: parseInt(id),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["product", id]),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/store/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(id),
          userId: currentUserId,
          storeId: product.store_id,
          rating: reviewRating,
          reviewText,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product", id]);
      setShowReview(false);
      setReviewText("");
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator color={COLORS.brand} size="large" />
      </View>
    );

  const { product } = data || {};
  if (!product) return null;

  const images = product.images?.length
    ? product.images
    : [product.thumbnail_url || "https://via.placeholder.com/400"];
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: COLORS.bg,
            alignItems: "center",
            justifyContent: "center",
            ...SHADOW.sm,
          }}
        >
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => wishlistMutation.mutate()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: COLORS.bg,
              alignItems: "center",
              justifyContent: "center",
              ...SHADOW.sm,
            }}
          >
            <Heart
              size={20}
              color={product.inWishlist ? COLORS.error : COLORS.textMuted}
              fill={product.inWishlist ? COLORS.error : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: COLORS.bg,
              alignItems: "center",
              justifyContent: "center",
              ...SHADOW.sm,
            }}
          >
            <Share2 size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: COLORS.bg,
              alignItems: "center",
              justifyContent: "center",
              ...SHADOW.sm,
            }}
          >
            <ShoppingCart size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Images */}
        <View style={{ position: "relative" }}>
          <ExpoImage
            source={{ uri: images[activeImg] }}
            style={{ width: "100%", height: 380 }}
            contentFit="cover"
          />
          {discount > 0 && (
            <View
              style={{
                position: "absolute",
                top: insets.top + 60,
                right: 12,
                backgroundColor: COLORS.error,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                -{discount}% OFF
              </Text>
            </View>
          )}
          {images.length > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: 12,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {images.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveImg(i)}
                  style={{
                    width: i === activeImg ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      i === activeImg ? COLORS.brand : COLORS.bg + "90",
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 10,
            }}
          >
            {images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImg(i)}>
                <ExpoImage
                  source={{ uri: img }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    borderWidth: 2.5,
                    borderColor: i === activeImg ? COLORS.brand : COLORS.border,
                  }}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={{ padding: 16 }}>
          {product.category && (
            <Text
              style={{
                color: COLORS.brand,
                fontSize: 12,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              {product.category}
            </Text>
          )}
          <Text
            style={{
              color: COLORS.text,
              fontSize: 22,
              fontWeight: "800",
              lineHeight: 28,
              marginBottom: 10,
            }}
          >
            {product.name}
          </Text>

          {/* Price + Rating */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{ color: COLORS.brand, fontSize: 28, fontWeight: "800" }}
              >
                ${parseFloat(product.price).toFixed(2)}
              </Text>
              {product.original_price && (
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 15,
                    textDecorationLine: "line-through",
                  }}
                >
                  ${parseFloat(product.original_price).toFixed(2)}
                </Text>
              )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    color={COLORS.gold}
                    fill={
                      star <= Math.round(parseFloat(product.avg_rating) || 0)
                        ? COLORS.gold
                        : "none"
                    }
                  />
                ))}
              </View>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {parseFloat(product.avg_rating || 0).toFixed(1)} (
                {product.review_count} reviews)
              </Text>
            </View>
          </View>

          {/* Stock & Sold */}
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor:
                  product.stock_qty > 0
                    ? COLORS.successLight
                    : COLORS.errorLight,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    product.stock_qty > 0 ? COLORS.success : COLORS.error,
                }}
              />
              <Text
                style={{
                  color: product.stock_qty > 0 ? COLORS.success : COLORS.error,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {product.stock_qty > 0
                  ? `${product.stock_qty} in stock`
                  : "Out of stock"}
              </Text>
            </View>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 12,
                alignSelf: "center",
              }}
            >
              {product.sold_count || 0} sold
            </Text>
          </View>

          {/* Description */}
          {product.description && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                {product.description}
              </Text>
            </View>
          )}

          {/* Quantity */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              gap: 16,
            }}
          >
            <Text
              style={{ color: COLORS.text, fontSize: 15, fontWeight: "600" }}
            >
              Quantity
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 20,
                    fontWeight: "600",
                  }}
                >
                  −
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  width: 40,
                  textAlign: "center",
                  color: COLORS.text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 20,
                    fontWeight: "600",
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Store Info */}
          <TouchableOpacity
            onPress={() => router.push(`/store/${product.store_id}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 14,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Store size={20} color={COLORS.brand} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}
              >
                {product.store_name}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Tap to visit store
              </Text>
            </View>
            <Text style={{ color: COLORS.brand, fontSize: 13 }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              Reviews
            </Text>
            {currentUserId && (
              <TouchableOpacity
                onPress={() => setShowReview(true)}
                style={{
                  backgroundColor: COLORS.brand + "15",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  Write Review
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {product.reviews?.map((review) => (
            <View
              key={review.id}
              style={{
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <ExpoImage
                  source={{
                    uri:
                      review.profile_picture ||
                      "https://via.placeholder.com/36",
                  }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {review.full_name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      marginTop: 2,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        color={COLORS.gold}
                        fill={s <= review.rating ? COLORS.gold : "none"}
                      />
                    ))}
                  </View>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </View>
              {review.review_text && (
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                >
                  {review.review_text}
                </Text>
              )}
            </View>
          ))}

          {(!product.reviews || product.reviews.length === 0) && (
            <View
              style={{
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 14,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 10 }}>⭐</Text>
              <Text
                style={{ color: COLORS.text, fontSize: 15, fontWeight: "600" }}
              >
                No reviews yet
              </Text>
              <Text
                style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}
              >
                Be the first to review!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.bg,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            addToCartMutation.mutate();
            setTimeout(() => router.push("/checkout"), 500);
          }}
          disabled={product.stock_qty === 0}
          style={{
            flex: 1,
            backgroundColor: COLORS.bgSecondary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: COLORS.brand,
          }}
        >
          <Text
            style={{ color: COLORS.brand, fontSize: 16, fontWeight: "700" }}
          >
            Buy Now
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => addToCartMutation.mutate()}
          disabled={product.stock_qty === 0 || addToCartMutation.isPending}
          style={{
            flex: 1.5,
            backgroundColor:
              product.stock_qty > 0 ? COLORS.brand : COLORS.textLight,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ShoppingCart size={18} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReview}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: COLORS.text,
                fontSize: 20,
                fontWeight: "700",
                flex: 1,
              }}
            >
              Write a Review
            </Text>
            <TouchableOpacity onPress={() => setShowReview(false)}>
              <Text style={{ color: COLORS.brand, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            Your Rating
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                <Star
                  size={36}
                  color={COLORS.gold}
                  fill={s <= reviewRating ? COLORS.gold : "none"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            Your Review
          </Text>
          <TextInput
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Share your experience with this product..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={500}
            style={{
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 12,
              padding: 14,
              color: COLORS.text,
              fontSize: 14,
              minHeight: 120,
              textAlignVertical: "top",
            }}
          />
          <TouchableOpacity
            onPress={() => reviewMutation.mutate()}
            disabled={reviewMutation.isPending}
            style={{
              marginTop: 24,
              backgroundColor: COLORS.brand,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
