export interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  region: string;
}

export const brazilianAirports: Airport[] = [
  // ===================== SUDESTE =====================
  // Espírito Santo
  { code: 'VIX', name: 'Aeroporto Eurico de Aguiar Salles', city: 'Vitória', state: 'ES', region: 'Sudeste' },
  { code: 'GUZ', name: 'Aeroporto de Guarapari', city: 'Guarapari', state: 'ES', region: 'Sudeste' },

  // Minas Gerais
  { code: 'CNF', name: 'Aeroporto Internacional de Confins', city: 'Belo Horizonte', state: 'MG', region: 'Sudeste' },
  { code: 'PLU', name: 'Aeroporto da Pampulha', city: 'Belo Horizonte', state: 'MG', region: 'Sudeste' },
  { code: 'MOC', name: 'Aeroporto Mário Ribeiro', city: 'Montes Claros', state: 'MG', region: 'Sudeste' },
  { code: 'UDI', name: 'Aeroporto Ten. Cel. Av. César Bombonato', city: 'Uberlândia', state: 'MG', region: 'Sudeste' },
  { code: 'UBA', name: 'Aeroporto Mário de Almeida Franco', city: 'Uberaba', state: 'MG', region: 'Sudeste' },
  { code: 'IZA', name: 'Aeroporto Regional da Zona da Mata', city: 'Juiz de Fora', state: 'MG', region: 'Sudeste' },
  { code: 'GVR', name: 'Aeroporto Coronel Altino Machado', city: 'Governador Valadares', state: 'MG', region: 'Sudeste' },
  { code: 'IPN', name: 'Aeroporto Regional do Vale do Aço', city: 'Ipatinga', state: 'MG', region: 'Sudeste' },
  { code: 'JDF', name: 'Aeroporto Francisco de Assis', city: 'Juiz de Fora', state: 'MG', region: 'Sudeste' },
  { code: 'JDR', name: 'Aeroporto Pref. Octávio de Almeida Neves', city: 'São João del Rei', state: 'MG', region: 'Sudeste' },
  { code: 'VAG', name: 'Aeroporto Major Brigadeiro Trompowski', city: 'Varginha', state: 'MG', region: 'Sudeste' },
  { code: 'POJ', name: 'Aeroporto de Patos de Minas', city: 'Patos de Minas', state: 'MG', region: 'Sudeste' },

  // Rio de Janeiro
  { code: 'SDU', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste' },
  { code: 'GIG', name: 'Aeroporto Internacional do Galeão', city: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste' },
  { code: 'RRJ', name: 'Aeroporto de Jacarepaguá', city: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste' },
  { code: 'CFB', name: 'Aeroporto de Cabo Frio', city: 'Cabo Frio', state: 'RJ', region: 'Sudeste' },
  { code: 'CAW', name: 'Aeroporto Bartolomeu Lisandro', city: 'Campos dos Goytacazes', state: 'RJ', region: 'Sudeste' },
  { code: 'MEA', name: 'Aeroporto de Macaé', city: 'Macaé', state: 'RJ', region: 'Sudeste' },
  { code: 'QAR', name: 'Aeroporto de Angra dos Reis', city: 'Angra dos Reis', state: 'RJ', region: 'Sudeste' },
  { code: 'REZ', name: 'Aeroporto de Resende', city: 'Resende', state: 'RJ', region: 'Sudeste' },
  { code: 'JPY', name: 'Aeroporto de Paraty', city: 'Paraty', state: 'RJ', region: 'Sudeste' },

  // São Paulo
  { code: 'CGH', name: 'Aeroporto de Congonhas', city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  { code: 'GRU', name: 'Aeroporto Internacional de Guarulhos', city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  { code: 'VCP', name: 'Aeroporto Internacional de Viracopos', city: 'Campinas', state: 'SP', region: 'Sudeste' },
  { code: 'RAO', name: 'Aeroporto Leite Lopes', city: 'Ribeirão Preto', state: 'SP', region: 'Sudeste' },
  { code: 'SJK', name: 'Aeroporto Prof. Urbano Ernesto Stumpf', city: 'São José dos Campos', state: 'SP', region: 'Sudeste' },
  { code: 'SJP', name: 'Aeroporto Prof. Eriberto Manoel Reino', city: 'São José do Rio Preto', state: 'SP', region: 'Sudeste' },
  { code: 'JTC', name: 'Aeroporto de Bauru/Arealva', city: 'Bauru', state: 'SP', region: 'Sudeste' },
  { code: 'AQA', name: 'Aeroporto Bartolomeu de Gusmão', city: 'Araraquara', state: 'SP', region: 'Sudeste' },
  { code: 'ARU', name: 'Aeroporto de Araçatuba', city: 'Araçatuba', state: 'SP', region: 'Sudeste' },
  { code: 'PPB', name: 'Aeroporto de Presidente Prudente', city: 'Presidente Prudente', state: 'SP', region: 'Sudeste' },
  { code: 'MII', name: 'Aeroporto Frank Miloye Milenkovich', city: 'Marília', state: 'SP', region: 'Sudeste' },
  { code: 'VOT', name: 'Aeroporto Domingos Pignatari', city: 'Votuporanga', state: 'SP', region: 'Sudeste' },
  { code: 'UBT', name: 'Aeroporto Estadual Gastão Madeira', city: 'Ubatuba', state: 'SP', region: 'Sudeste' },

  // ===================== CENTRO-OESTE =====================
  // Goiás
  { code: 'GYN', name: 'Aeroporto Internacional de Goiânia', city: 'Goiânia', state: 'GO', region: 'Centro-Oeste' },
  { code: 'CLV', name: 'Aeroporto de Caldas Novas', city: 'Caldas Novas', state: 'GO', region: 'Centro-Oeste' },
  { code: 'RVD', name: 'Aeroporto General Leite de Castro', city: 'Rio Verde', state: 'GO', region: 'Centro-Oeste' },

  // Distrito Federal
  { code: 'BSB', name: 'Aeroporto Internacional de Brasília', city: 'Brasília', state: 'DF', region: 'Centro-Oeste' },

  // Mato Grosso do Sul
  { code: 'CGR', name: 'Aeroporto Internacional de Campo Grande', city: 'Campo Grande', state: 'MS', region: 'Centro-Oeste' },
  { code: 'CMG', name: 'Aeroporto Internacional de Corumbá', city: 'Corumbá', state: 'MS', region: 'Centro-Oeste' },
  { code: 'DOU', name: 'Aeroporto Regional de Dourados', city: 'Dourados', state: 'MS', region: 'Centro-Oeste' },
  { code: 'BYO', name: 'Aeroporto Regional de Bonito', city: 'Bonito', state: 'MS', region: 'Centro-Oeste' },
  { code: 'TJL', name: 'Aeroporto Municipal Plínio Alarcon', city: 'Três Lagoas', state: 'MS', region: 'Centro-Oeste' },

  // Mato Grosso
  { code: 'CGB', name: 'Aeroporto Internacional Marechal Rondon', city: 'Cuiabá', state: 'MT', region: 'Centro-Oeste' },
  { code: 'BPG', name: 'Aeroporto de Barra do Garças', city: 'Barra do Garças', state: 'MT', region: 'Centro-Oeste' },
  { code: 'AFL', name: 'Aeroporto de Alta Floresta', city: 'Alta Floresta', state: 'MT', region: 'Centro-Oeste' },
  { code: 'CFO', name: 'Aeroporto de Confresa', city: 'Confresa', state: 'MT', region: 'Centro-Oeste' },
  { code: 'JIA', name: 'Aeroporto de Juína', city: 'Juína', state: 'MT', region: 'Centro-Oeste' },
  { code: 'ROO', name: 'Aeroporto Maestro Marinho Franco', city: 'Rondonópolis', state: 'MT', region: 'Centro-Oeste' },
  { code: 'SXO', name: 'Aeroporto de São Félix do Araguaia', city: 'São Félix do Araguaia', state: 'MT', region: 'Centro-Oeste' },
  { code: 'SMT', name: 'Aeroporto Regional de Sorriso', city: 'Sorriso', state: 'MT', region: 'Centro-Oeste' },
  { code: 'OPS', name: 'Aeroporto de Sinop', city: 'Sinop', state: 'MT', region: 'Centro-Oeste' },
  { code: 'TGQ', name: 'Aeroporto de Tangará da Serra', city: 'Tangará da Serra', state: 'MT', region: 'Centro-Oeste' },

  // ===================== NORTE =====================
  // Acre
  { code: 'RBR', name: 'Aeroporto Internacional de Rio Branco', city: 'Rio Branco', state: 'AC', region: 'Norte' },
  { code: 'CZS', name: 'Aeroporto de Cruzeiro do Sul', city: 'Cruzeiro do Sul', state: 'AC', region: 'Norte' },

  // Amazonas
  { code: 'MAO', name: 'Aeroporto Internacional Eduardo Gomes', city: 'Manaus', state: 'AM', region: 'Norte' },
  { code: 'CAF', name: 'Aeroporto de Carauari', city: 'Carauari', state: 'AM', region: 'Norte' },
  { code: 'CIZ', name: 'Aeroporto de Coari', city: 'Coari', state: 'AM', region: 'Norte' },
  { code: 'ERN', name: 'Aeroporto Amaury Feitosa Tomaz', city: 'Eirunepé', state: 'AM', region: 'Norte' },
  { code: 'LBR', name: 'Aeroporto Regional de Lábrea', city: 'Lábrea', state: 'AM', region: 'Norte' },
  { code: 'PIN', name: 'Aeroporto Júlio Belém', city: 'Parintins', state: 'AM', region: 'Norte' },
  { code: 'SJL', name: 'Aeroporto de São Gabriel da Cachoeira', city: 'São Gabriel da Cachoeira', state: 'AM', region: 'Norte' },
  { code: 'TFF', name: 'Aeroporto de Tefé', city: 'Tefé', state: 'AM', region: 'Norte' },
  { code: 'MBZ', name: 'Aeroporto Regional de Maués', city: 'Maués', state: 'AM', region: 'Norte' },
  { code: 'MNX', name: 'Aeroporto de Manicoré', city: 'Manicoré', state: 'AM', region: 'Norte' },
  { code: 'TBT', name: 'Aeroporto de Tabatinga', city: 'Tabatinga', state: 'AM', region: 'Norte' },
  { code: 'BAZ', name: 'Aeroporto de Barcelos', city: 'Barcelos', state: 'AM', region: 'Norte' },
  { code: 'IRZ', name: 'Aeroporto de Santa Isabel do Rio Negro', city: 'Santa Isabel do Rio Negro', state: 'AM', region: 'Norte' },

  // Pará
  { code: 'BEL', name: 'Aeroporto Internacional de Belém', city: 'Belém', state: 'PA', region: 'Norte' },
  { code: 'ALT', name: 'Aeroporto de Alenquer', city: 'Alenquer', state: 'PA', region: 'Norte' },
  { code: 'ATM', name: 'Aeroporto de Altamira', city: 'Altamira', state: 'PA', region: 'Norte' },
  { code: 'CKS', name: 'Aeroporto de Carajás', city: 'Parauapebas', state: 'PA', region: 'Norte' },
  { code: 'ITB', name: 'Aeroporto de Itaituba', city: 'Itaituba', state: 'PA', region: 'Norte' },
  { code: 'MAB', name: 'Aeroporto de Marabá', city: 'Marabá', state: 'PA', region: 'Norte' },
  { code: 'MEU', name: 'Aeroporto de Monte Dourado', city: 'Monte Dourado', state: 'PA', region: 'Norte' },
  { code: 'OBI', name: 'Aeroporto de Óbidos', city: 'Óbidos', state: 'PA', region: 'Norte' },
  { code: 'ORX', name: 'Aeroporto de Oriximiná', city: 'Oriximiná', state: 'PA', region: 'Norte' },
  { code: 'OIA', name: 'Aeroporto de Ourilândia do Norte', city: 'Ourilândia do Norte', state: 'PA', region: 'Norte' },
  { code: 'PTQ', name: 'Aeroporto de Porto de Moz', city: 'Porto de Moz', state: 'PA', region: 'Norte' },
  { code: 'TMT', name: 'Aeroporto de Porto Trombetas', city: 'Porto Trombetas', state: 'PA', region: 'Norte' },
  { code: 'STM', name: 'Aeroporto Internacional de Santarém', city: 'Santarém', state: 'PA', region: 'Norte' },
  { code: 'TUR', name: 'Aeroporto de Tucuruí', city: 'Tucuruí', state: 'PA', region: 'Norte' },

  // Tocantins
  { code: 'PMW', name: 'Aeroporto Brigadeiro Lysias Rodrigues', city: 'Palmas', state: 'TO', region: 'Norte' },
  { code: 'AUX', name: 'Aeroporto Regional de Araguaína', city: 'Araguaína', state: 'TO', region: 'Norte' },

  // Amapá
  { code: 'MCP', name: 'Aeroporto Internacional de Macapá', city: 'Macapá', state: 'AP', region: 'Norte' },

  // Roraima
  { code: 'BVB', name: 'Aeroporto Internacional de Boa Vista', city: 'Boa Vista', state: 'RR', region: 'Norte' },

  // Rondônia
  { code: 'PVH', name: 'Aeroporto Internacional de Porto Velho', city: 'Porto Velho', state: 'RO', region: 'Norte' },
  { code: 'OAL', name: 'Aeroporto de Cacoal', city: 'Cacoal', state: 'RO', region: 'Norte' },
  { code: 'JPR', name: 'Aeroporto de Ji-Paraná', city: 'Ji-Paraná', state: 'RO', region: 'Norte' },
  { code: 'BVH', name: 'Aeroporto de Vilhena', city: 'Vilhena', state: 'RO', region: 'Norte' },

  // ===================== NORDESTE =====================
  // Alagoas
  { code: 'MCZ', name: 'Aeroporto Zumbi dos Palmares', city: 'Maceió', state: 'AL', region: 'Nordeste' },

  // Bahia
  { code: 'SSA', name: 'Aeroporto Dep. Luís Eduardo Magalhães', city: 'Salvador', state: 'BA', region: 'Nordeste' },
  { code: 'IOS', name: 'Aeroporto Jorge Amado', city: 'Ilhéus', state: 'BA', region: 'Nordeste' },
  { code: 'BPS', name: 'Aeroporto de Porto Seguro', city: 'Porto Seguro', state: 'BA', region: 'Nordeste' },
  { code: 'LEC', name: 'Aeroporto Horácio de Mattos', city: 'Lençóis', state: 'BA', region: 'Nordeste' },
  { code: 'PAV', name: 'Aeroporto de Paulo Afonso', city: 'Paulo Afonso', state: 'BA', region: 'Nordeste' },
  { code: 'BRA', name: 'Aeroporto de Barreiras', city: 'Barreiras', state: 'BA', region: 'Nordeste' },
  { code: 'FEC', name: 'Aeroporto João Durval Carneiro', city: 'Feira de Santana', state: 'BA', region: 'Nordeste' },
  { code: 'VAL', name: 'Aeroporto de Valença', city: 'Valença', state: 'BA', region: 'Nordeste' },
  { code: 'GNM', name: 'Aeroporto de Guanambi', city: 'Guanambi', state: 'BA', region: 'Nordeste' },
  { code: 'TXF', name: 'Aeroporto de Teixeira de Freitas', city: 'Teixeira de Freitas', state: 'BA', region: 'Nordeste' },
  { code: 'VDC', name: 'Aeroporto Glauber de Andrade Rocha', city: 'Vitória da Conquista', state: 'BA', region: 'Nordeste' },

  // Ceará
  { code: 'FOR', name: 'Aeroporto Internacional Pinto Martins', city: 'Fortaleza', state: 'CE', region: 'Nordeste' },
  { code: 'JDO', name: 'Aeroporto Orlando Bezerra de Menezes', city: 'Juazeiro do Norte', state: 'CE', region: 'Nordeste' },
  { code: 'ARX', name: 'Aeroporto Regional de Canoa Quebrada', city: 'Aracati', state: 'CE', region: 'Nordeste' },
  { code: 'JJD', name: 'Aeroporto de Jericoacoara', city: 'Cruz', state: 'CE', region: 'Nordeste' },

  // Maranhão
  { code: 'SLZ', name: 'Aeroporto Marechal Cunha Machado', city: 'São Luís', state: 'MA', region: 'Nordeste' },
  { code: 'IMP', name: 'Aeroporto Prefeito Renato Moreira', city: 'Imperatriz', state: 'MA', region: 'Nordeste' },

  // Paraíba
  { code: 'JPA', name: 'Aeroporto Presidente Castro Pinto', city: 'João Pessoa', state: 'PB', region: 'Nordeste' },
  { code: 'CPV', name: 'Aeroporto Presidente João Suassuna', city: 'Campina Grande', state: 'PB', region: 'Nordeste' },

  // Pernambuco
  { code: 'REC', name: 'Aeroporto Internacional de Recife', city: 'Recife', state: 'PE', region: 'Nordeste' },
  { code: 'CAU', name: 'Aeroporto de Caruaru', city: 'Caruaru', state: 'PE', region: 'Nordeste' },
  { code: 'FEN', name: 'Aeroporto de Fernando de Noronha', city: 'Fernando de Noronha', state: 'PE', region: 'Nordeste' },
  { code: 'PNZ', name: 'Aeroporto Senador Nilo Coelho', city: 'Petrolina', state: 'PE', region: 'Nordeste' },

  // Piauí
  { code: 'THE', name: 'Aeroporto Senador Petrônio Portella', city: 'Teresina', state: 'PI', region: 'Nordeste' },
  { code: 'PHB', name: 'Aeroporto Internacional de Parnaíba', city: 'Parnaíba', state: 'PI', region: 'Nordeste' },

  // Rio Grande do Norte
  { code: 'NAT', name: 'Aeroporto Internacional de Natal', city: 'Natal', state: 'RN', region: 'Nordeste' },
  { code: 'MVF', name: 'Aeroporto Dix Sept Rosado', city: 'Mossoró', state: 'RN', region: 'Nordeste' },

  // Sergipe
  { code: 'AJU', name: 'Aeroporto de Aracaju', city: 'Aracaju', state: 'SE', region: 'Nordeste' },

  // ===================== SUL =====================
  // Paraná
  { code: 'CWB', name: 'Aeroporto Internacional Afonso Pena', city: 'Curitiba', state: 'PR', region: 'Sul' },
  { code: 'IGU', name: 'Aeroporto Internacional das Cataratas', city: 'Foz do Iguaçu', state: 'PR', region: 'Sul' },
  { code: 'LDB', name: 'Aeroporto Governador José Richa', city: 'Londrina', state: 'PR', region: 'Sul' },
  { code: 'MGF', name: 'Aeroporto Silvio Name Júnior', city: 'Maringá', state: 'PR', region: 'Sul' },
  { code: 'CAC', name: 'Aeroporto de Cascavel', city: 'Cascavel', state: 'PR', region: 'Sul' },
  { code: 'GPB', name: 'Aeroporto Tancredo Thomaz de Faria', city: 'Guarapuava', state: 'PR', region: 'Sul' },
  { code: 'TOW', name: 'Aeroporto de Toledo', city: 'Toledo', state: 'PR', region: 'Sul' },
  { code: 'PTO', name: 'Aeroporto de Pato Branco', city: 'Pato Branco', state: 'PR', region: 'Sul' },
  { code: 'PGZ', name: 'Aeroporto de Ponta Grossa', city: 'Ponta Grossa', state: 'PR', region: 'Sul' },

  // Rio Grande do Sul
  { code: 'POA', name: 'Aeroporto Internacional Salgado Filho', city: 'Porto Alegre', state: 'RS', region: 'Sul' },
  { code: 'CXJ', name: 'Aeroporto Hugo Cantergiani', city: 'Caxias do Sul', state: 'RS', region: 'Sul' },
  { code: 'PFB', name: 'Aeroporto Lauro Kortz', city: 'Passo Fundo', state: 'RS', region: 'Sul' },
  { code: 'PET', name: 'Aeroporto Internacional de Pelotas', city: 'Pelotas', state: 'RS', region: 'Sul' },
  { code: 'RIA', name: 'Aeroporto de Santa Maria', city: 'Santa Maria', state: 'RS', region: 'Sul' },
  { code: 'GEL', name: 'Aeroporto Sepé Tiaraju', city: 'Santo Ângelo', state: 'RS', region: 'Sul' },
  { code: 'TSQ', name: 'Aeroporto de Torres', city: 'Torres', state: 'RS', region: 'Sul' },
  { code: 'URG', name: 'Aeroporto Internacional de Uruguaiana', city: 'Uruguaiana', state: 'RS', region: 'Sul' },

  // Santa Catarina
  { code: 'FLN', name: 'Aeroporto Internacional Hercílio Luz', city: 'Florianópolis', state: 'SC', region: 'Sul' },
  { code: 'JOI', name: 'Aeroporto Lauro Carneiro de Loyola', city: 'Joinville', state: 'SC', region: 'Sul' },
  { code: 'XAP', name: 'Aeroporto Serafim Enoss Bertaso', city: 'Chapecó', state: 'SC', region: 'Sul' },
  { code: 'CCM', name: 'Aeroporto Diomício Freitas', city: 'Criciúma', state: 'SC', region: 'Sul' },
  { code: 'NVT', name: 'Aeroporto Internacional de Navegantes', city: 'Navegantes', state: 'SC', region: 'Sul' },
  { code: 'JJG', name: 'Aeroporto Regional Sul', city: 'Jaguaruna', state: 'SC', region: 'Sul' },
  { code: 'LAJ', name: 'Aeroporto Antonio Correia Pinto de Macedo', city: 'Lages', state: 'SC', region: 'Sul' },
];

/**
 * Search airports by code, city name, or state.
 * Returns up to `limit` results (default 10).
 */
export function searchAirports(query: string, limit = 10): Airport[] {
  if (!query || query.length < 2) return [];

  const q = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return brazilianAirports
    .filter((a) => {
      const code = a.code.toLowerCase();
      const city = a.city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const state = a.state.toLowerCase();
      const name = a.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return (
        code.includes(q) ||
        city.includes(q) ||
        state === q ||
        name.includes(q)
      );
    })
    .slice(0, limit);
}
