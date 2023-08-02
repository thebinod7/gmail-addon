import { fetchColumnValues } from '../services/monday';
import { BOARD_COLUMNS } from '../constants';

const { NAME, RATING, EMAIL, PERSON, PHONE, LINK, COLOR, DROPDOWN, DATE, FILES, TEXT, NUMBERS } = BOARD_COLUMNS;

export const getBoardItemsFromSettingStr = input => {
	const settings_str = input?.settings_str || '';
	if (!settings_str) return [];
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

const getBoardColumnsByType = (type, boardColumns) => {
	const filtered = boardColumns.filter(b => b.type === type);
	if (!filtered.length) return filtered;
	const selectOptions = filtered.map(f => {
		return {
			label: f.title,
			id: f.id
		};
	});
	return selectOptions;
};

export const extractColumnsForEachField = found => {
	const emailColumns = getBoardColumnsByType(EMAIL, found.columns);
	const phoneColumns = getBoardColumnsByType(PHONE, found.columns);
	const linkColumns = getBoardColumnsByType(LINK, found.columns);
	const statusColumns = getBoardColumnsByType(COLOR, found.columns);
	const dropdownColumns = getBoardColumnsByType(DROPDOWN, found.columns);
	const personColumns = getBoardColumnsByType(PERSON, found.columns);
	const ratingColumns = getBoardColumnsByType(RATING, found.columns);
	const dateColumns = getBoardColumnsByType(DATE, found.columns);
	const fileColumns = getBoardColumnsByType(FILES, found.columns);
	const textColumns = getBoardColumnsByType(TEXT, found.columns);
	const numberColumns = getBoardColumnsByType(NUMBERS, found.columns);

	return {
		emailColumns,
		phoneColumns,
		linkColumns,
		statusColumns,
		dropdownColumns,
		personColumns,
		ratingColumns,
		dateColumns,
		fileColumns,
		textColumns,
		numberColumns
	};
};
