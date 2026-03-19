import Servico from '#models/servico'
import { HttpContext } from '@adonisjs/core/http'

export default class ServicosController {
  /**
   * Lista todos os serviços disponíveis
   */
  async index({ response }: HttpContext) {
    const servicos = await Servico.all()
    return response.ok(servicos)
  }

  /**
   * Cria um novo serviço
   */
  async store({ request, response }: HttpContext) {
    // LINHA DE DEPURAÇÃO: Isso mostrará no seu terminal do Adonis
    // exatamente o JSON que o frontend está enviando.
    console.log('Corpo da requisição recebido:', request.body())
    const data = request.only(['nome', 'preco', 'duracao'])
    
    const servico = await Servico.create(data)
    
    return response.created(servico)
  }

  /**
   * Atualiza um serviço existente
   */
  async update({ params, request, response }: HttpContext) {
    const servico = await Servico.findOrFail(params.id)
    const data = request.only(['nome', 'descricao', 'preco']) // Lembre-se que talvez precise ajustar aqui também
    servico.merge(data)
    await servico.save()
    return response.ok(servico)
  }

  /**
   * Deleta um serviço
   */
  async destroy({ params, response }: HttpContext) {
    const servico = await Servico.findOrFail(params.id)
    await servico.delete()
    return response.noContent()
  }
}