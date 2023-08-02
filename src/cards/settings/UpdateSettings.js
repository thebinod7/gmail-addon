import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, mapGroupsByBoard, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';

import createHeaderTxt from './HeaderText';
import createBoardSelector from './BoardSelector';
import { SELECT_NULL, BOARD_COLUMNS } from '../../constants';
import createColumnSelector from '../widgets/BoardColumnSelector';
import { extractColumnsForEachField } from '../../utils/misc';

const { NAME, EMAIL, PERSON, PHONE, LINK, COLOR, DROPDOWN, DATE, TEXT, NUMBERS } = BOARD_COLUMNS;

export default function UpdateSettingsCard({ currentBoard }) {
	try {
		// Fetch boards by userID
		const { id } = getCurrentAccount();
		const { data } = fetchBoardItems();
		const { boards } = filterBoardByUser(id, data);
		const mappedGroups = mapGroupsByBoard(boards);
		const filteredBoards = filterSubitemBoards(boards);
		const { mappedColumns, boardOptions } = mapBoardColumnsAndSelectOptions(filteredBoards);
		const found = mappedColumns.find(f => f.boardId === currentBoard);
		const columnOptions = extractColumnsForEachField(found);

		// Render board select DROPDOWN
		// Fetch settings by accountID
		// If settings exist => Render form  fields with selectors
		// If board selected => Render form fields with selectors
		return renderUI({ boardOptions, columnOptions, currentBoard, columns: found?.columns || [] });
	} catch (err) {
		console.log('UpdateSettingsCardErr=>', err);
	}
}

function renderUI({ boardOptions, currentBoard, columns, columnOptions }) {
	console.log({ currentBoard });
	let cardDivider = CardService.newDivider();

	let boardSelector = createBoardSelector();
	const formAction = CardService.newAction().setFunctionName('handleSaveSettings');
	const btnSubmit = CardService.newTextButton()
		.setText('Submit')
		.setOnClickAction(formAction)
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED);

	if (boardOptions.length) {
		boardSelector.addItem('--Select--', SELECT_NULL, false);
		for (let b of boardOptions) {
			const selected = b.value.toString() === currentBoard;
			boardSelector.addItem(b.label, b.value.toString(), selected);
		}
	} else boardSelector.addItem('--Select--', SELECT_NULL, true);

	const text = createHeaderTxt();

	console.log('columns===>', columns);
	let cardSection = CardService.newCardSection();

	cardSection.addWidget(text).addWidget(cardDivider).addWidget(boardSelector).addWidget(cardDivider);

	if (columns.length) {
		const {
			emailColumns,
			phoneColumns,
			linkColumns,
			statusColumns,
			dropdownColumns,
			personColumns,
			dateColumns,
			textColumns,
			numberColumns
		} = columnOptions;
		for (let col of columns) {
			const { title } = col;
			if (col.type === DATE) {
				const cols = createColumnSelector(dateColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === EMAIL) {
				const cols = createColumnSelector(emailColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === LINK) {
				const cols = createColumnSelector(linkColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === PERSON) {
				const cols = createColumnSelector(personColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === PHONE) {
				const cols = createColumnSelector(phoneColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === COLOR) {
				const cols = createColumnSelector(statusColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === DROPDOWN) {
				const cols = createColumnSelector(dropdownColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === TEXT) {
				const cols = createColumnSelector(textColumns, title);
				cardSection.addWidget(cols);
			}
			if (col.type === NUMBERS) {
				const cols = createColumnSelector(numberColumns, title);
				cardSection.addWidget(cols);
			}
		}
	}
	cardSection.addWidget(cardDivider).addWidget(btnSubmit);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
