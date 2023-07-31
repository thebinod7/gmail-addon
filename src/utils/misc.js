import { fetchColumnValues } from '../services/monday';

export const getBoardItemsFromSettingStr = input => {
	console.log('INPUT===>', input);
	const { settings_str } = input;
	if (!settings_str) return [];
	console.log('STREEE=>', settings_str);
	const boardIds = getBoardIDsFromSettingStr(settings_str);
	const res = fetchColumnValues(boardIds);
	const { boards } = res.data;
	const rowItems = boards.length ? boards[0].items : [];
	return { rowItems, boardId: boardIds[0] };
};

function getBoardIDsFromSettingStr(settings_str) {
	const jsonData = JSON.parse(settings_str);
	return jsonData?.boardIds || [];
}
