const { DB } = require('./lib/index.cjs');

const ranks = [
    {
        key: 'copper',
        name: 'Đồng',
        threshold: 0,
        order: 1,
        color: '#cd7f32',
        logoPath: '/ranks/copper.png',
        description: 'Thành viên Đồng'
    },
    {
        key: 'silver',
        name: 'Bạc',
        threshold: 10000,
        order: 2,
        color: '#c0c0c0',
        logoPath: '/ranks/silver.png',
        description: 'Thành viên Bạc'
    },
    {
        key: 'gold',
        name: 'Vàng',
        threshold: 30000,
        order: 3,
        color: '#ffd700',
        logoPath: '/ranks/gold.png',
        description: 'Thành viên Vàng'
    },
    {
        key: 'diamond',
        name: 'Kim Cương',
        threshold: 100000,
        order: 4,
        color: '#b9f2ff',
        logoPath: '/ranks/diamond.png',
        description: 'Thành viên Kim Cương'
    },
    {
        key: 'emerald',
        name: 'Lục Bảo',
        threshold: 500000,
        order: 5,
        color: '#50c878',
        logoPath: '/ranks/emerald.png',
        description: 'Thành viên Lục Bảo'
    }
];

module.exports.up = async function () {
    console.log('Member ranks migration started');

    for (const rank of ranks) {
        const exists = await DB.collection('ranks').findOne({ key: rank.key });

        if (!exists) {
            await DB.collection('ranks').insertOne({
                ...rank,
                rewardVoucherCode: '',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Inserted rank: ${rank.key}`);
        } else {
            await DB.collection('ranks').updateOne(
                { key: rank.key },
                {
                    $set: {
                        name: rank.name,
                        threshold: rank.threshold,
                        order: rank.order,
                        color: rank.color,
                        logoPath: rank.logoPath,
                        description: rank.description,
                        updatedAt: new Date()
                    }
                }
            );
            console.log(`Updated rank: ${rank.key}`);
        }
    }

    console.log('Member ranks migration completed');
};

module.exports.down = async function () {
    await DB.collection('ranks').deleteMany({ key: { $in: ranks.map(r => r.key) } });
    console.log('Rollback member ranks completed');
};
