import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../utils/AppError";

export const adminOnly=async(request:any ,reply :FastifyReply)=>{
    //authMiddleware zaten request.user'ı doldurmuş olacak 
    //Burada sadece rol kontrolü yapıyoruz 

 if(!request.user || request.user.role !=="ADMIN")
 {
    throw new AppError("Bu alana erişim yetkiniz yok .Sadece Adminler girebilir",403)
 }
};