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
    identifier:z.string()
    .trim()
    .min(1,"Email or username is required")
    .max(254,"Email or username is too long")
    .optional(),
    email:z.string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .optional(),
    password: z.string().nonempty("Password is required")
}).superRefine(({identifier,email},context)=>{
    if(!identifier && !email){
        context.addIssue({
            code:z.ZodIssueCode.custom,
            path:["identifier"],
            message:"Email or username is required"
        });
    }
    if(identifier && email){
        context.addIssue({
            code:z.ZodIssueCode.custom,
            path:["identifier"],
            message:"Provide either identifier or email, not both"
        });
    }
}).transform(({identifier,email,password})=>({
    identifier:identifier || email,
    password
}));

module.exports={signupSchema, loginSchema};
