import { Schema } from "mongoose";

// ==================== DOCUMENT MIDDLEWARE ====================

// Pre-save hook: قبل حفظ المستند
export const preSaveHook = function(this: any, next: Function) {
  console.log(`Pre-save: About to save user with email: ${this.email}`);
  
  // يمكن إضافة logic هنا مثل:
  // - التحقق من البيانات
  // - تعديل البيانات قبل الحفظ
  // - إرسال notification
  
  next();
};

// Post-save hook: بعد حفظ المستند
export const postSaveHook = function(this: any, doc: any, next: Function) {
  console.log(`Post-save: User saved successfully: ${doc.email}`);
  
  // يمكن إضافة logic هنا مثل:
  // - إرسال إيميل ترحيبي
  // - تسجيل في logs
  // - إنشاء profile افتراضي
  
  next();
};

// Pre-remove hook: قبل حذف المستند
export const preRemoveHook = function(this: any, next: Function) {
  console.log(`Pre-remove: About to delete user: ${this._id}`);
  
  // يمكن إضافة logic هنا مثل:
  // - حذف بيانات مرتبطة
  // - أرشفة البيانات
  // - إرسال تأكيد الحذف
  
  next();
};

// Post-remove hook: بعد حذف المستند
export const postRemoveHook = function(this: any, doc: any, next: Function) {
  console.log(`Post-remove: User deleted: ${doc.email}`);
  
  // يمكن إضافة logic هنا مثل:
  // - تنظيف الملفات المرفوعة
  // - حذف sessions
  
  next();
};

// ==================== QUERY MIDDLEWARE ====================

// Pre-find hook: قبل عمل query للبحث
export const preFindHook = function(this: any, next: Function) {
  console.log(`Pre-find: Running find query`);
  
  // يمكن إضافة logic هنا مثل:
  // - إضافة filters افتراضية
  // - تسجيل الـ queries
  
  // مثال: إخفاء المستخدمين المحذوفين (soft delete)
  // this.find({ isDeleted: { $ne: true } });
  
  next();
};

// Post-find hook: بعد عمل query للبحث
export const postFindHook = function(this: any, docs: any[], next: Function) {
  console.log(`Post-find: Found ${docs.length} users`);
  
  // يمكن إضافة logic هنا مثل:
  // - تعديل النتائج
  // - إضافة بيانات إضافية
  
  next();
};

// Pre-findOne hook: قبل البحث عن مستند واحد
export const preFindOneHook = function(this: any, next: Function) {
  console.log(`Pre-findOne: Running findOne query`);
  next();
};

// Pre-findOneAndUpdate hook: قبل البحث والتحديث
export const preFindOneAndUpdateHook = function(this: any, next: Function) {
  console.log(`Pre-findOneAndUpdate: About to update user`);
  
  // يمكن إضافة logic هنا مثل:
  // - تحديث updatedAt timestamp
  // - validation إضافية
  
  this.set({ updatedAt: new Date() });
  
  next();
};

// Post-findOneAndUpdate hook: بعد البحث والتحديث
export const postFindOneAndUpdateHook = function(this: any, doc: any, next: Function) {
  if (doc) {
    console.log(`Post-findOneAndUpdate: User updated: ${doc.email}`);
  }
  next();
};

// Pre-deleteOne hook: قبل حذف مستند
export const preDeleteOneHook = function(this: any, next: Function) {
  console.log(`Pre-deleteOne: About to delete user`);
  
  // يمكن إضافة logic هنا مثل:
  // - soft delete بدلاً من الحذف النهائي
  // - التحقق من الصلاحيات
  
  next();
};

// Post-deleteOne hook: بعد حذف مستند
export const postDeleteOneHook = function(this: any, result: any, next: Function) {
  console.log(`Post-deleteOne: Deleted ${result.deletedCount} user(s)`);
  next();
};

// ==================== AGGREGATE MIDDLEWARE ====================

// Pre-aggregate hook: قبل عمل aggregation
export const preAggregateHook = function(this: any, next: Function) {
  console.log(`Pre-aggregate: Running aggregation pipeline`);
  
  // يمكن إضافة logic هنا مثل:
  // - إضافة stages للـ pipeline
  // - فلترة البيانات
  
  next();
};

// ==================== VALIDATION MIDDLEWARE ====================

// Pre-validate hook: قبل validation
export const preValidateHook = function(this: any, next: Function) {
  console.log(`Pre-validate: Validating user data`);
  
  // يمكن إضافة logic هنا مثل:
  // - تنظيف البيانات
  // - تحويل القيم
  
  // مثال: تحويل الإيميل لـ lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  next();
};

// Post-validate hook: بعد validation
export const postValidateHook = function(this: any, doc: any, next: Function) {
  console.log(`Post-validate: User data validated successfully`);
  next();
};