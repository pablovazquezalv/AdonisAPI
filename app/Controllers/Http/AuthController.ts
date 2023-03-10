import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import axios from 'axios';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'


export default class AuthController {

  public async enviarCodigo({view,params }: HttpContextContract) 
  {
    
    const usuario = await User.findOrFail(params.id);
    

    const code = Math.floor(Math.random() * 9999);
    usuario.code = code;
    await usuario.save();

    try {
      const response = await axios.post('https://rest.nexmo.com/sms/json', {
        from: 'Equipos Api ',
        text: `Tu código de verificación  es: ${code}`,
        to: `52528718458147`,
        api_key: 'c2e5605a',
        api_secret: 'gbvxqZPChrgzv0W4',
      });
      const html = await view.render('emails/welcome')
      
      return html

    } 
    
    catch (error) 
    {
      return error;
    }
  }

  public async verificarCodigo({response, request,params }: HttpContextContract)
  {

    const validationSchema = schema.create({
      code: schema.number(),
    })

    const data = await request.validate({
       schema: validationSchema,
       messages: {
          'code.required': 'El código es requerido',
          'code.number': 'El código debe ser un número',
    
    }});


    
    const usuario = await User.findOrFail(params.id);

    if(usuario.code == data.code)
    {
      usuario.status = 1;
      await usuario.save();
      return response.status(200).json({message: 'Código correcto'});
    }
    else
    {
      return response.status(400).json({message: 'Código incorrecto'});
    }

  }

  public async reenviarCodigo({ response,params }: HttpContextContract)
  {
    
    const verificarCodigo =Env.get('SERVER') +Route.makeSignedUrl('verificarCodigo', {id:params.id},{expiresIn: '1h'})          

    const usuario = await User.findOrFail(params.id);
    
    const code = Math.floor(Math.random() * 9999);
    usuario.code = code;
    await usuario.save();

    try 
    {
           await axios.post('https://rest.nexmo.com/sms/json', {
            from: 'Equipos Api ',
            text: `Tu  nuevo código de verificación  es: ${code}`,
            to: `528718458147`,
            api_key: 'c2e5605a',
            api_secret: 'gbvxqZPChrgzv0W4',
          });

          return response.status(200).json({message: 'Código reenviado',url:verificarCodigo});
          

    } catch (error) 
    {
      return response.status(400).json({message: 'Error al reenviar código'});
    }
  }




  public async verificarToken({ auth, response })
   {
    try {
      await auth.check();
      
      const user = auth.user;
      
      return response.status(200).json({
        message: 'Token válido',
        id: user.id,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      return response.status(401).json({
        message: 'Token no válido',
        data: error,
      });
    }
  }
  
}
