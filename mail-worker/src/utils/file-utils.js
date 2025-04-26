const fileUtils = {
	getExtFileName(filename) {
		const index = filename.lastIndexOf('.');
		return index !== -1 ? filename.slice(index) : '';
	}
};

export default fileUtils

