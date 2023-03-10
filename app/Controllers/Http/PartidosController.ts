import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Partido from 'App/Models/Partido'
import Database from '@ioc:Adonis/Lucid/Database';

export default class PartidosController 
{
    public async agregar({ request, response }: HttpContextContract)
    {
        
        const validationSchema = schema.create({
             local: schema.number([
                rules.required(),
                rules.exists({ table: 'equipos', column: 'id' })
                ]),
            visitante: schema.number([
                rules.exists({ table: 'equipos', column: 'id' }),
                rules.different(request.input('local')),
                ]),
            fecha: schema.date({}, [
                rules.required(),
                ]),
            hora: schema.date({}, [
                rules.required(),
                ]),
                
        })
        try {
            const data = await request.validate({
                schema: validationSchema,
                messages: {
                    'local.required': 'El equipo local es requerido',
                    'local.number': 'El equipo local debe ser un número',
                    'local.minLength': 'El equipo local debe tener al menos 1 dígito',
                    'local.maxLength': 'El equipo local debe tener como máximo 3 dígitos',
                    'local.exists': 'El equipo local no existe',
                    
                    'visitante.required': 'El equipo visitante es requerido',
                    'visitante.number': 'El equipo visitante debe ser un número',
                    'visitante.minLength': 'El equipo visitante debe tener al menos 1 dígito',
                    'visitante.maxLength': 'El equipo visitante debe tener como máximo 3 dígitos',
                    'visitante.exists': 'El equipo visitante no existe',
                    'visitante.notEquals': 'El equipo visitante no puede ser el mismo que el local',

                    'fecha.required': 'La fecha es requerida',
                    'hora.required': 'La hora es requerida',

                },
            });

            
          const { local,visitante,fecha,hora } = data;
            
          const partido = new Partido();
            partido.local = local;
            partido.visitante = visitante;
            partido.fecha = fecha;
            partido.hora = hora;

         await partido.save();
            return response.status(200).json({message: 'Partido agregado correctamente', partido: partido});
        } catch (error) 
        {
            return response.status(400).json({message: 'Error al agregar partido', error: error.messages});
        }
    }

    public async editar({ request, response,params }: HttpContextContract)
    {
        
        const validationSchema = schema.create({
            local: schema.number([
               rules.required(),
               rules.exists({ table: 'equipos', column: 'id' })
               ]),
           visitante: schema.number([
               rules.exists({ table: 'equipos', column: 'id' }),
               rules.different(request.input('local')),
               ]),
           fecha: schema.date({}, [
               rules.required(),
               ]),
           hora: schema.date({}, [
               rules.required(),
               ]),
               
       })
       try {
           const data = await request.validate({
               schema: validationSchema,
               messages: {
                   'local.required': 'El equipo local es requerido',
                   'local.number': 'El equipo local debe ser un número',
                   'local.minLength': 'El equipo local debe tener al menos 1 dígito',
                   'local.maxLength': 'El equipo local debe tener como máximo 3 dígitos',
                   'local.exists': 'El equipo local no existe',
                   
                   'visitante.required': 'El equipo visitante es requerido',
                   'visitante.number': 'El equipo visitante debe ser un número',
                   'visitante.minLength': 'El equipo visitante debe tener al menos 1 dígito',
                   'visitante.maxLength': 'El equipo visitante debe tener como máximo 3 dígitos',
                   'visitante.exists': 'El equipo visitante no existe',
                   'visitante.notEquals': 'El equipo visitante no puede ser el mismo que el local',

                   'fecha.required': 'La fecha es requerida',
                   'hora.required': 'La hora es requerida',

               },
           });


            const partido = await Partido.findOrFail(params.id);
            if (partido) 
            {
                partido.local = data.local;
                partido.visitante = data.visitante;
                partido.fecha = data.fecha;
                partido.hora = data.hora;
                await partido.save();
                return response.status(200).json({message: 'Partido editado correctamente', partido: partido});
            }
            else
            {
                return response.status(400).json({message: 'Error al editar partido'});
            }
    }
    catch (error) 
        {
            return response.badRequest({message: 'Error al editar partido', error: error.messages});
        }
       
    }

    public async eliminar({response,params }: HttpContextContract)
    {
        const partido  = await Partido.findOrFail(params.id);

        if(partido)
        {
            await partido.delete();
            return response.status(200).json({message: 'El partido se elimino correctamente'});
        }

        return response.notFound({message: 'El partido no existe.'});
    }

    public async mostrar({response }: HttpContextContract)
    {
        const partido = await Database
        .from('partidos')
        .join('equipos', 'equipos.id', '=', 'partidos.local')
        .join('equipos as visitante', 'visitante.id', '=', 'partidos.visitante')
        .select('partidos.id','equipos.nombre as local','visitante.nombre as visitante',Database.raw("date_format(partidos.fecha, '%Y-%m-%d') as fecha"),'partidos.hora')
        .orderBy('partidos.id', 'asc')

        if(partido)
        {
            return partido;
        }

        else
        {
            return response.notFound({message: 'No hay partidos registrados.'});
        }
    }

    public async mostrarUnico({ response, params }: HttpContextContract)
    {
        const partido = Partido.find(params.id);

        if(partido)
        {
            return partido;
        }

        else
        {
            return response.notFound({ message: 'El partido no existe.' });
        }
    }
}
