'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        'relative h-1 w-full cursor-pointer rounded-full bg-white/20',
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        className='absolute left-0 top-0 h-full rounded-full bg-white'
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
};

const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      const newVolume = value / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  return (
    <motion.div
      className='relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl bg-[#11111198] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className='w-full'
        onTimeUpdate={handleTimeUpdate}
        src={src}
        onClick={togglePlay}
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            className='absolute bottom-0 left-0 right-0 m-2 mx-auto max-w-xl rounded-2xl bg-[#11111198] p-4 backdrop-blur-md'
            initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: 'circInOut', type: 'spring' }}
          >
            <div className='mb-2 flex items-center gap-2'>
              <span className='text-sm text-white'>
                {formatTime(currentTime)}
              </span>
              <CustomSlider
                value={progress}
                onChange={handleSeek}
                className='flex-1'
              />
              <span className='text-sm text-white'>{formatTime(duration)}</span>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={togglePlay}
                    variant='ghost'
                    size='icon'
                    className='text-white hover:bg-[#111111d1] hover:text-white'
                  >
                    {isPlaying ? (
                      <Pause className='h-5 w-5' />
                    ) : (
                      <Play className='h-5 w-5' />
                    )}
                  </Button>
                </motion.div>
                <div className='flex items-center gap-x-1'>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      onClick={toggleMute}
                      variant='ghost'
                      size='icon'
                      className='text-white hover:bg-[#111111d1] hover:text-white'
                    >
                      {isMuted ? (
                        <VolumeX className='h-5 w-5' />
                      ) : volume > 0.5 ? (
                        <Volume2 className='h-5 w-5' />
                      ) : (
                        <Volume1 className='h-5 w-5' />
                      )}
                    </Button>
                  </motion.div>

                  <div className='w-24'>
                    <CustomSlider
                      value={volume * 100}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    key={speed}
                  >
                    <Button
                      onClick={() => setSpeed(speed)}
                      variant='ghost'
                      size='icon'
                      className={cn(
                        'text-white hover:bg-[#111111d1] hover:text-white',
                        playbackSpeed === speed && 'bg-[#111111d1]'
                      )}
                    >
                      {speed}x
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoPlayer;
