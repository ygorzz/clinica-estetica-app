// database/seeders/user_seeder.ts

import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // updateOrCreate - Procura pelo e-mail, e cria o usuário apenas se ele não existir.
    // Se existir, apenas garante que os dados estão atualizados.
    await User.updateOrCreate(
      { email: 'dono@clinica.com' }, // Condição para procurar
      {
        fullName: 'Dono Ygor',
        password: 'senha123',
        role: 'dono',
      }
    )
    await User.updateOrCreate(
      { email: 'gerente@clinica.com' }, // Condição para procurar
      {
        fullName: 'Gerente Teste',
        password: 'gerente123',
        role: 'gerente',
      }
    )
    await User.updateOrCreate(
      { email: 'recepcao@clinica.com' }, // Condição para procurar
      {
        fullName: 'Recepcionista Teste',
        password: 'recepcao123',
        role: 'recepcionista',
      }
    )
    await User.updateOrCreate(
      { email: 'profissional@clinica.com' }, // Condição para procurar
      {
        fullName: 'Profissional Teste',
        password: 'profissional123',
        role: 'profissional',
      }
    )

    // 5. [Opcional] Remover o usuário 'funcionario' antigo, se ele ainda existir
    // O updateOrCreate acima lida com o e-mail 'recepcao@clinica.com',
    // mas se você quiser garantir que 'funcionario@clinica.com' não exista mais:
    const oldFuncionario = await User.findBy('email', 'funcionario@clinica.com')
    if (oldFuncionario) {
      await oldFuncionario.delete()
    }
  }
}