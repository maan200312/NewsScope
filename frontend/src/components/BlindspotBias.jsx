function BlindspotBiasBar({ score = 50 }) {

    let left = 0;
    let center = 0;
    let right = 0;

    if (score < 50) {
        left = 50 - score;
        center = 50;
        right = score / 2;
    } else {
        right = score - 50;
        center = 50;
        left = (100 - score) / 2;
    }

    const total = left + center + right;

    left = (left / total) * 100;
    center = (center / total) * 100;
    right = (right / total) * 100;

    return (

        <div className="mt-3">

            {/* Bar */}

            <div className="flex h-3 rounded overflow-hidden">

                <div
                    className="bg-red-600"
                    style={{ width: `${left}%` }}
                />

                <div
                    className="bg-gray-300"
                    style={{ width: `${center}%` }}
                />

                <div
                    className="bg-blue-600"
                    style={{ width: `${right}%` }}
                />

            </div>

            {/* Labels */}

            <div className="flex justify-between text-[11px] mt-1">

                <span className="text-red-500">
                    Left {Math.round(left)}%
                </span>

                <span className="text-gray-400">
                    Center {Math.round(center)}%
                </span>

                <span className="text-blue-500">
                    Right {Math.round(right)}%
                </span>

            </div>

        </div>

    );
}

export default BlindspotBiasBar;