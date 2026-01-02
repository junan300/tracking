import React, { useMemo } from 'react';
import { EMOJI_CATEGORIES, CATEGORY_NAMES } from '../utils/constants.js';

const EmojiPicker = React.memo(({ emojiPickerGoalId, overlayClickable, selectedCategory, onEmojiSelect, onCategoryChange }) => {
    if (emojiPickerGoalId === null) {
        return null;
    }

    const filteredEmojis = EMOJI_CATEGORIES[selectedCategory] || [];
    
    // Memoize the style object to prevent unnecessary re-renders
    const overlayStyle = useMemo(() => ({ 
        pointerEvents: overlayClickable ? 'auto' : 'none' 
    }), [overlayClickable]);

    return (
        <div 
            className="emoji-picker-overlay"
            style={overlayStyle}
            onMouseDown={(e) => {
                // Prevent clicks on modal from closing it
                if (e.target !== e.currentTarget) {
                    e.stopPropagation();
                    return;
                }
                // Ignore clicks immediately after opening
                if (!overlayClickable) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }}
            onClick={(e) => {
                // Check if click is directly on overlay (not on modal content)
                if (e.target === e.currentTarget && overlayClickable) {
                    onEmojiSelect(null); // Pass null to close
                }
            }}
        >
            <div 
                className="emoji-picker-modal"
                style={{ pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    // Stop propagation to prevent overlay handler from firing
                    e.stopPropagation();
                }}
            >
                <div className="emoji-picker-header">
                    <span className="emoji-picker-title">Choose an Emoji</span>
                    <button 
                        className="emoji-picker-close"
                        onClick={() => {
                            onEmojiSelect(null); // Pass null to close
                        }}
                    >
                        ✕
                    </button>
                </div>
                <div className="emoji-picker-categories">
                    {CATEGORY_NAMES.map(category => (
                        <button
                            key={category}
                            className={`emoji-category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => onCategoryChange(category)}
                            title={category}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="emoji-picker-grid">
                    {filteredEmojis.map((emoji, index) => (
                        <div
                            key={`${emoji}-${index}`}
                            className="emoji-picker-item"
                            onClick={() => onEmojiSelect(emoji)}
                            title={emoji}
                        >
                            {emoji}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if emojiPickerGoalId, overlayClickable, or selectedCategory actually changed
    const emojiChanged = prevProps.emojiPickerGoalId !== nextProps.emojiPickerGoalId;
    const clickableChanged = prevProps.overlayClickable !== nextProps.overlayClickable;
    const categoryChanged = prevProps.selectedCategory !== nextProps.selectedCategory;
    const emojiSelectChanged = prevProps.onEmojiSelect !== nextProps.onEmojiSelect;
    const categoryChangeChanged = prevProps.onCategoryChange !== nextProps.onCategoryChange;
    const shouldUpdate = emojiChanged || clickableChanged || categoryChanged || emojiSelectChanged || categoryChangeChanged;
    
    return !shouldUpdate; // Return true to skip re-render
});

EmojiPicker.displayName = 'EmojiPicker';

export default EmojiPicker;

