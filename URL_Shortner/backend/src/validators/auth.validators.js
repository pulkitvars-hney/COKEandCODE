const {z}=require("zod");
const reserved=[
    "admin",
    "login",
    "signup",
    "api",
];
const signupSchema=z.object({
      username: z.string()
      .trim()
      .min(3, "Username must be at least 3 character long ")
      .max(20, "Username must be less than 20 characters long").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens and underscores")
      .refine((value)=>!reserved.includes(value.toLowerCase()),{
        message:"This username is reserved."
      }),
      email:z.string()
      .toLowerCase()
      .email("Invalid email address"),
      password:z.string()
      .min(8,"Password must be at least 8 characters long")
      .max(64,"Password must be less than 64 characters long")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
})
const loginSchema=z.object({
    email:z.string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
    password: z.string().nonempty("Password is required")
});

module.exports={signupSchema, loginSchema};
