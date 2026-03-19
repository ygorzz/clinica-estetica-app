import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class CreateUser extends BaseCommand {
  static commandName = 'create:user'
  static description = 'Cria um novo usuário com as credenciais fornecidas.'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const fullName = await this.prompt.ask('Digite o nome completo do usuário')
    const email = await this.prompt.ask('Digite o email do usuário')
    const password = await this.prompt.secure('Digite a senha do usuário')
    const role = await this.prompt.choice('Escolha o nível de acesso', ['dono', 'gerente', 'funcionario'])

    await User.create({ fullName, email, password, role })

    this.logger.info(`Usuário com email '${email}' e nível de acesso '${role}' criado com sucesso!`)
  }
}
