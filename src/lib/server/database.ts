import { env } from '$env/dynamic/private';

import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = new Sequelize(env.CONNECTION_STRING!);

try {
	await sequelize.authenticate();
	console.log('Connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

class Transaction extends Model {}

Transaction.init(
	{
		txHash: {
			type: DataTypes.STRING
		},
		txData: {
			type: DataTypes.JSON
			// allowNull defaults to true
		}
	},
	{
		sequelize,
		modelName: 'Transaction'
	}
);

export { Transaction };
