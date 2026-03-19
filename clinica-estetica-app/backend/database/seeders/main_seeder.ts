// database/seeders/main_seeder.ts

import { BaseSeeder } from '@adonisjs/lucid/seeders'

// 1. Importe os arquivos com seus NOVOS nomes (.data.ts)
// O executor automático do Adonis vai ignorar esses arquivos,
// mas nós podemos importá-los e executá-los manualmente.
import UserSeeder from '#database/seeders/parts/user_data'
import ServicoSeeder from '#database/seeders/parts/servico_data'
import ClienteSeeder from '#database/seeders/parts/cliente_data'
import AgendamentoSeeder from '#database/seeders/parts/agendamento_data'

export default class MainSeeder extends BaseSeeder {
  async run() {
    /**
     * Executando os seeders na ordem de dependência correta.
     */

    // 1. Crie os usuários primeiro
    await new UserSeeder(this.client).run()

    // 2. Crie serviços e clientes
    await new ServicoSeeder(this.client).run()
    await new ClienteSeeder(this.client).run()

    // 3. Crie os agendamentos por último
    await new AgendamentoSeeder(this.client).run()
  }
}