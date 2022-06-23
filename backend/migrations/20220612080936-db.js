'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    //  return queryInterface.sequelize.query("ALTER TYPE enum_purchases_location ADD VALUE 'store'");
    // 1. Change the type of the column to string
    return queryInterface.changeColumn('Purchases', 'location', {
      type: Sequelize.STRING,
    })
    // 2. Drop the enum
    .then(() => {
      const pgEnumDropQuery = queryInterface.QueryGenerator.pgEnumDrop('Purchases', 'location');
      return queryInterface.sequelize.query(pgEnumDropQuery);
    })
    // 3. Create the enum with the new values
    .then(() => {
      return queryInterface.changeColumn('Purchases', 'location', {
        type: Sequelize.ENUM,
        values: [
          'store',
        ],
        defaultValue: 'store'
      });
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     return queryInterface.changeColumn('Purchases', 'location', {
      type: Sequelize.STRING,
    }).then(() => {
      const pgEnumDropQuery = queryInterface.QueryGenerator.pgEnumDrop('Purchases', 'location');
      return queryInterface.sequelize.query(pgEnumDropQuery);
    }).then(() => {
      return queryInterface.changeColumn('Purchases', 'location', {
        type: Sequelize.ENUM,
        values: [
          'store',
        ],
        defaultValue: 'store'
      });
    })
  },
};
