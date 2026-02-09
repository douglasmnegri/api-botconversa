exports.up = async function(knex) {
  await knex('custom_printing')
    .where({ paper_size: 'A4' })
    .update({ DTF: 7.5 });

  await knex('custom_printing')
    .where({ paper_size: 'A3' })
    .update({ DTF: 11 });
};

exports.down = async function(knex) {
  // rollback to original values
  await knex('custom_printing')
    .where({ paper_size: 'A4' })
    .update({ DTF: 13 });

  await knex('custom_printing')
    .where({ paper_size: 'A3' })
    .update({ DTF: 25 });
};
