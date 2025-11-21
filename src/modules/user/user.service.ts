import userRepository from "./user.repository";
import { CreateUserDTO, LoginDTO } from "./user.dto";
import bcrypt from "bcrypt";
import { generateOTP, hashToken, generateOTPExpiry, getEmailVerificationTemplate } from "../../utils/emailTemplates/Confirm_Email_Part_1";
import { sendEmail } from "../../utils/send_email_function";

export const createUser = async (dto: CreateUserDTO) => {
  const hashed = await bcrypt.hash(dto.password, 10);
  
  const otp = generateOTP();
  const hashedToken = hashToken(otp);
  
  const user = await userRepository.create({ 
    ...dto, 
    password: hashed,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: generateOTPExpiry(10)
  } as any);

  const emailHtml = getEmailVerificationTemplate(otp, user.name);
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: emailHtml
  });

  return { 
    id: user._id, 
    name: user.name, 
    email: user.email, 
    role: user.role,
    isEmailVerified: user.isEmailVerified 
  };
};

export const loginUser = async (dto: LoginDTO) => {
  const user = await userRepository.findByEmail(dto.email);
  if (!user) throw { status: 400, message: "Invalid credentials" };
  
  const match = await bcrypt.compare(dto.password, user.password!);
  if (!match) throw { status: 400, message: "Invalid credentials" };
  
  return { 
    id: user._id, 
    name: user.name, 
    email: user.email, 
    role: user.role,
    isEmailVerified: user.isEmailVerified 
  };
};

export const getAllUsers = async () => {
  return await userRepository.findAllWithoutPassword();
};