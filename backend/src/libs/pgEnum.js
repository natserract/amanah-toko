import PostgresQueryGenerator from 'sequelize/lib/dialects/postgres/query-generator';

// /lib/dialects/postgres/query-generator
PostgresQueryGenerator.prototype.pgEnum = function(tableName, attr, dataType, options) {
  const enumName = this.pgEnumName(tableName, attr, options);
  let values;

  if (dataType.values) {
    values = `ENUM(${dataType.values.map(value => this.escape(value)).join(', ')})`;
  } else {
    values = dataType.toString().match(/^ENUM\(.+\)/)[0];
  }

  let sql = `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_${ tableName }_${ attr }') THEN CREATE TYPE ${ enumName } AS ${ values }; END IF; END$$;`;
  if (!!options && options.force === true) {
    sql = this.pgEnumDrop(tableName, attr) + sql;
  }
  return sql;
}

PostgresQueryGenerator.prototype.changeColumnQuery = function (tableName, attributes) {
  const query = (subQuery) => `ALTER TABLE ${this.quoteTable(tableName)} ALTER COLUMN ${subQuery};`;
  const sql = [];
  for (const attributeName in attributes) {
    let definition = this.dataTypeMapping(tableName, attributeName, attributes[attributeName]);
    let attrSql = '';

    if (definition.includes('NOT NULL')) {
      attrSql += query(`${this.quoteIdentifier(attributeName)} SET NOT NULL`);

      definition = definition.replace('NOT NULL', '').trim();
    } else if (!definition.includes('REFERENCES')) {
      attrSql += query(`${this.quoteIdentifier(attributeName)} DROP NOT NULL`);
    }

    if (definition.includes('DEFAULT')) {
      attrSql += query(`${this.quoteIdentifier(attributeName)} SET DEFAULT ${definition.match(/DEFAULT ([^;]+)/)[1]}`);

      definition = definition.replace(/(DEFAULT[^;]+)/, '').trim();
    } else if (!definition.includes('REFERENCES')) {
      attrSql += query(`${this.quoteIdentifier(attributeName)} DROP DEFAULT`);
    }

    if (attributes[attributeName].startsWith('ENUM(')) {
      attrSql += this.pgEnum(tableName, attributeName, attributes[attributeName]);
      definition = definition.replace(/^ENUM\(.+\)/, this.pgEnumName(tableName, attributeName, { schema: false }));
      // definition += ` USING (${this.quoteIdentifier(attributeName)}::${this.pgEnumName(tableName, attributeName)})`;
    }

    if (definition.match(/UNIQUE;*$/)) {
      definition = definition.replace(/UNIQUE;*$/, '');
      attrSql += query(`ADD UNIQUE (${this.quoteIdentifier(attributeName)})`).replace('ALTER COLUMN', '');
    }

    if (definition.includes('REFERENCES')) {
      definition = definition.replace(/.+?(?=REFERENCES)/, '');
      attrSql += query(`ADD FOREIGN KEY (${this.quoteIdentifier(attributeName)}) ${definition}`).replace('ALTER COLUMN', '');
    } else {
      attrSql += query(`${this.quoteIdentifier(attributeName)} TYPE ${definition}`);
    }

    sql.push(attrSql);
  }

  return sql.join('');
};

module.exports = () => PostgresQueryGenerator;
