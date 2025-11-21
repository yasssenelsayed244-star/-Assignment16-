// ==================== DOCUMENT MIDDLEWARE ====================

// Pre-save: قبل حفظ التعليق
export const preSaveHook = function(this: any, next: Function) {
  console.log(`Pre-save: About to save comment on post: ${this.postId}`);
  
  // يمكن إضافة logic مثل:
  // - فلترة الكلمات غير اللائقة
  // - التحقق من وجود المنشور
  
  next();
};

// Post-save: بعد حفظ التعليق
export const postSaveHook = async function(this: any, doc: any, next: Function) {
  console.log(`Post-save: Comment created on post: ${doc.postId}`);
  
  // يمكن إضافة logic مثل:
  // - إرسال notification لصاحب المنشور
  // - تحديث عدد التعليقات
  // - تحديث آخر نشاط على المنشور
  
  next();
};

// Pre-remove: قبل حذف التعليق
export const preRemoveHook = function(this: any, next: Function) {
  console.log(`Pre-remove: About to delete comment: ${this._id}`);
  next();
};

// Post-remove: بعد حذف التعليق
export const postRemoveHook = function(this: any, doc: any, next: Function) {
  console.log(`Post-remove: Comment deleted: ${doc._id}`);
  
  // يمكن إضافة logic مثل:
  // - تحديث عدد التعليقات على المنشور
  // - إرسال notification
  
  next();
};

// ==================== QUERY MIDDLEWARE ====================

// Pre-find: قبل البحث
export const preFindHook = function(this: any, next: Function) {
  console.log(`Pre-find: Running find query for comments`);
  
  // populate الـ author تلقائياً
  this.populate("author", "name email");
  
  next();
};

// Post-find: بعد البحث
export const postFindHook = function(this: any, docs: any[], next: Function) {
  console.log(`Post-find: Found ${docs.length} comments`);
  next();
};

// Pre-findOneAndUpdate: قبل التحديث
export const preFindOneAndUpdateHook = function(this: any, next: Function) {
  console.log(`Pre-findOneAndUpdate: About to update comment`);
  this.set({ updatedAt: new Date() });
  next();
};

// Post-findOneAndUpdate: بعد التحديث
export const postFindOneAndUpdateHook = function(this: any, doc: any, next: Function) {
  if (doc) {
    console.log(`Post-findOneAndUpdate: Comment updated: ${doc._id}`);
  }
  next();
};

// Pre-deleteOne: قبل الحذف
export const preDeleteOneHook = function(this: any, next: Function) {
  console.log(`Pre-deleteOne: About to delete comment`);
  next();
};

// Post-deleteOne: بعد الحذف
export const postDeleteOneHook = function(this: any, result: any, next: Function) {
  console.log(`Post-deleteOne: Deleted ${result.deletedCount} comment(s)`);
  next();
};