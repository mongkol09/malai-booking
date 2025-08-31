const themeModeInitialState = {
    themeMode: 'light',
};

const themeInitialState = {
    themeColor: 'PurpleHeart',
};

const strokeInitialState = {
    borderStroke: 'svgstroke-a',
};

const bodyGradientInitialState = {
    gradientColor: 'bg-gradient',
};

const boxLayoutInitialState = {
    boxLayout: '',
};

const monochromeInitialState = {
    monochrome: '',
};

const borderRadiusInitialState = {
    borderRadius: '',
};

const iconColorInitialState = {
    iconColor: '',
};

export const themeModeReducer = (state = themeModeInitialState, action) => {
    switch (action.type) {
      case 'SET_THEME_MODE':
        return {
          ...state,
          themeMode: action.payload,
        };
      default:
        return state;
    }
};

export const themeReducer = (state = themeInitialState, action) => {
    switch (action.type) {
      case 'SET_THEME_COLOR':
        return {
          ...state,
          themeColor: action.payload,
        };
      default:
        return state;
    }
};

export const strokeReducer = (state = strokeInitialState, action) => {
    switch (action.type) {
      case 'SET_BORDER_STROKE':
        return {
          ...state,
          borderStroke: action.payload,
        };
      default:
        return state;
    }
};

export const bodyGradientReducer = (state = bodyGradientInitialState, action) => {
    switch (action.type) {
        case 'SET_BODY_GRADIENT':
        return {
            ...state,
            gradientColor: action.payload,
        };
        default:
        return state;
    }
};

export const boxLayoutReducer = (state = boxLayoutInitialState, action) => {
    switch (action.type) {
        case 'SET_BOX_LAYOUT':
        return {
            ...state,
            boxLayout: action.payload,
        };
        default:
        return state;
    }
};

export const monochromeReducer = (state = monochromeInitialState, action) => {
    switch (action.type) {
      case 'SET_MONOCHROME':
        return {
          ...state,
          monochrome: action.payload,
        };
      default:
        return state;
    }
};

export const borderRadiusReducer = (state = borderRadiusInitialState, action) => {
    switch (action.type) {
      case 'SET_BORDER_RADIUS':
        return {
          ...state,
          borderRadius: action.payload,
        };
      default:
        return state;
    }
};

export const iconColorReducer = (state = iconColorInitialState, action) => {
    switch (action.type) {
      case 'SET_ICON_COLOR':
        return {
          ...state,
          iconColor: action.payload,
        };
      default:
        return state;
    }
};