// ==================== DOCUMENT MIDDLEWARE ====================

// Pre-save: قبل حفظ المنشور
export const preSaveHook = function(this: any, next: Function) {
  console.log(`Pre-save: About to save post by author: ${this.author}`);
  
  // يمكن إضافة logic مثل:
  // - فلترة الكلمات غير اللائقة
  // - إضافة tags تلقائية
  // - ضغط المحتوى
  
  next();
};

// Post-save: بعد حفظ المنشور
export const postSaveHook = function(this: any, doc: any, next: Function) {
  console.log(`Post-save: Post created with ID: ${doc._id}`);
  
  // يمكن إضافة logic مثل:
  // - إرسال notifications للمتابعين
  // - تحديث cache
  // - إضافة للـ feed
  
  next();
};

// Pre-remove: قبل حذف المنشور
export const preRemoveHook = function(this: any, next: Function) {
  console.log(`Pre-remove: About to delete post: ${this._id}`);
  
  // يمكن إضافة logic مثل:
  // - حذف التعليقات المرتبطة
  // - حذف الصور من S3
  // - تحديث إحصائيات المستخدم
  
  next();
};

// Post-remove: بعد حذف المنشور
export const postRemoveHook = async function(this: any, doc: any, next: Function) {
  console.log(`Post-remove: Post deleted: ${doc._id}`);
  
  // حذف جميع التعليقات المرتبطة بالمنشور
  try {
    const Comment = require("../comment/comment.model").default;
    await Comment.deleteMany({ postId: doc._id });
    console.log(`Deleted all comments for post: ${doc._id}`);
  } catch (error) {
    console.error("Error deleting comments:", error);
  }
  
  next();
};

// ==================== QUERY MIDDLEWARE ====================

// Pre-find: قبل البحث
export const preFindHook = function(this: any, next: Function) {
  console.log(`Pre-find: Running find query for posts`);
  
  // مثال: populate الـ author تلقائياً
  this.populate("author", "name email");
  
  next();
};

// Post-find: بعد البحث
export const postFindHook = function(this: any, docs: any[], next: Function) {
  console.log(`Post-find: Found ${docs.length} posts`);
  next();
};

// Pre-findOneAndUpdate: قبل التحديث
export const preFindOneAndUpdateHook = function(this: any, next: Function) {
  console.log(`Pre-findOneAndUpdate: About to update post`);
  
  // تحديث updatedAt تلقائياً
  this.set({ updatedAt: new Date() });
  
  next();
};

// Post-findOneAndUpdate: بعد التحديث
export const postFindOneAndUpdateHook = function(this: any, doc: any, next: Function) {
  if (doc) {
    console.log(`Post-findOneAndUpdate: Post updated: ${doc._id}`);
  }
  next();
};

// Pre-deleteOne: قبل الحذف
export const preDeleteOneHook = function(this: any, next: Function) {
  console.log(`Pre-deleteOne: About to delete post`);
  next();
};

// Post-deleteOne: بعد الحذف
export const postDeleteOneHook = function(this: any, result: any, next: Function) {
  console.log(`Post-deleteOne: Deleted ${result.deletedCount} post(s)`);
  next();
};